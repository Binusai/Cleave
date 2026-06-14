from .gemini_service import process_chat as gemini_chat
from .financial_context import build_financial_context

FINANCE_KEYWORDS = [
    'spend', 'spent', 'expense', 'owe', 'owed', 'settle', 'settlement',
    'group', 'balance', 'save', 'saving', 'budget', 'cost', 'money',
    'payment', 'pay', 'pending', 'category', 'analytics', 'health',
    'financial', 'finance', 'bill', 'split', 'share', 'contribution',
    'member', 'person', 'people', 'month', 'week', 'year', 'dining',
    'food', 'travel', 'rent', 'shopping', 'entertainment', 'compare',
    'most', 'highest', 'largest', 'top', 'who', 'which', 'how much',
    'where', 'when', 'what', 'my', 'show', 'list', 'tell', 'give',
    'how', 'can', 'reduce', 'improve', 'overview', 'summary', 'status',
]

NON_FINANCE_KEYWORDS = [
    'joke', 'funny', 'laugh', 'poem', 'song', 'code', 'java', 'python',
    'physics', 'chemistry', 'math', 'prime minister', 'president',
    'weather', 'movie', 'game', 'sport', 'cricket', 'football',
    'politics', 'religion', 'philosophy',
]


def is_finance_question(message):
    msg_lower = message.lower()
    for kw in NON_FINANCE_KEYWORDS:
        if kw in msg_lower:
            return False
    for kw in FINANCE_KEYWORDS:
        if kw in msg_lower:
            return True
    return False


def get_default_response():
    return {
        'text': "I am Cleave AI. I can help only with your financial activity, expenses, settlements, groups, analytics, budgeting and spending insights. Please ask a finance-related question.",
        'type': 'non_finance',
    }


def process_chat(user, message):
    if not is_finance_question(message):
        return get_default_response()
    return gemini_chat(user, message)