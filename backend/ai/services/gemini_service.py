import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
SYSTEM_PROMPT = """You are Cleave AI, a professional financial assistant for the Cleave fintech app.

RULES:
- Only answer questions about the user's financial data: expenses, settlements, groups, balances, spending patterns, savings, budgets, and financial health.
- If asked anything non-financial (coding, jokes, general knowledge, weather, sports, etc.), reply: "I am Cleave AI. I can help only with your financial activity, expenses, settlements, groups, analytics, budgeting and spending insights. Please ask a finance-related question."
- Keep responses short, professional, and actionable. No essays.
- Use Indian Rupee (₹) format.
- Be encouraging but professional. Not overly casual.
- If you don't have enough data to answer, say so honestly.
- Never make up data. Only use the context provided."""


def process_chat(user, message):
    from .financial_context import build_financial_context
    ctx = build_financial_context(user)

    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=SYSTEM_PROMPT
    )

    prompt = f"""User: {user.get_full_name() or user.email}

Financial Context:
- This month spending: ₹{ctx['financial_summary']['total_expenses_this_month']:,.0f}
- Last month spending: ₹{ctx['financial_summary']['total_expenses_last_month']:,.0f}
- Change: {ctx['financial_summary']['spending_change_percent']}%
- Top category: {ctx['financial_summary']['top_category']}
- You owe: ₹{ctx['financial_summary']['you_owe']:,.0f}
- You are owed: ₹{ctx['financial_summary']['you_are_owed']:,.0f}
- Net balance: ₹{ctx['financial_summary']['net_balance']:,.0f}
- Settlement rate: {ctx['financial_summary']['settlement_rate']}%
- Active groups: {ctx['active_groups_count']}
- Financial health: {ctx['health']['health_score']}/100 ({ctx['health']['health_label']})
- Pending settlements: {ctx['pending_settlements_count']}

Top groups: {', '.join(f"{g['name']} (₹{g['total_spent']:,.0f})" for g in ctx['top_groups'][:3])}

Top categories: {', '.join(f"{c['name']} ({c['percent']}%)" for c in ctx['categories'][:3])}

Question: {message}"""

    try:
        response = model.generate_content(prompt)
        return {
            'text': response.text,
            'type': 'ai',
        }
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return {
            'text': "I'm having trouble analyzing your finances right now. Please try again in a moment.",
            'type': 'error',
        }