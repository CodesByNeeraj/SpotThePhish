from agents import WebSearchTool
from agents.tool import WebSearchToolFilters

# Subdomains of these are allowed as well.
allowed_domains = [
    "ironscales.com",
    "scamshield.gov.sg",
    "huntress.com",
]

web_search_tool = WebSearchTool(
    search_context_size="medium",
    filters=WebSearchToolFilters(allowed_domains=allowed_domains),
)
