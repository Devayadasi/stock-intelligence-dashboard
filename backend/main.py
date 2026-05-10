from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd

app = FastAPI()

# CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Company symbols
companies = {
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "RELIANCE": "RELIANCE.NS",
    "HDFCBANK": "HDFCBANK.NS"
}


# Home Route
@app.get("/")
def home():
    return {"message": "Stock Dashboard API Running"}


# Health Check Route
@app.get("/health")
def health():
    return {"status": "healthy"}


# Get All Companies
@app.get("/companies")
def get_companies():
    return list(companies.keys())


# Get Last 30 Days Stock Data
@app.get("/data/{symbol}")
def get_stock_data(symbol: str):

    stock_symbol = companies.get(symbol.upper())

    if not stock_symbol:
        return {"error": "Company not found"}

    try:

        # Download stock data
        data = yf.download(stock_symbol, period="30d")

        # Fix multi-level columns issue
        data.columns = data.columns.get_level_values(0)

        # Reset index
        data.reset_index(inplace=True)

        # Convert date to string
        data["Date"] = data["Date"].astype(str)

        # Daily Return
        data["Daily_Return"] = (
            (data["Close"] - data["Open"]) / data["Open"]
        )

        # 7-Day Moving Average
        data["MA7"] = data["Close"].rolling(7).mean()

        # Volatility Score
        data["Volatility"] = (
            data["Daily_Return"].rolling(7).std()
        )

        # Replace NaN values
        data = data.fillna(0)

        # Return JSON
        return data.to_dict(orient="records")

    except Exception as e:

        return {
            "error": str(e)
        }


# Summary API
@app.get("/summary/{symbol}")
def get_summary(symbol: str):

    stock_symbol = companies.get(symbol.upper())

    if not stock_symbol:
        return {"error": "Company not found"}

    try:

        data = yf.download(stock_symbol, period="1y")

        # Fix multi-level columns
        data.columns = data.columns.get_level_values(0)

        summary = {
            "52_week_high":
                round(float(data["High"].max()), 2),

            "52_week_low":
                round(float(data["Low"].min()), 2),

            "average_close":
                round(float(data["Close"].mean()), 2)
        }

        return summary

    except Exception as e:

        return {
            "error": str(e)
        }


# Compare Two Stocks
@app.get("/compare")
def compare_stocks(symbol1: str, symbol2: str):

    stock1 = companies.get(symbol1.upper())
    stock2 = companies.get(symbol2.upper())

    if not stock1 or not stock2:
        return {"error": "Invalid symbols"}

    try:

        data1 = yf.download(stock1, period="30d")
        data2 = yf.download(stock2, period="30d")

        data1.columns = data1.columns.get_level_values(0)
        data2.columns = data2.columns.get_level_values(0)

        return {

            symbol1: {

                "latest_close":
                    round(
                        float(
                            data1["Close"].iloc[-1]
                        ),
                        2
                    ),

                "average_close":
                    round(
                        float(
                            data1["Close"].mean()
                        ),
                        2
                    )
            },

            symbol2: {

                "latest_close":
                    round(
                        float(
                            data2["Close"].iloc[-1]
                        ),
                        2
                    ),

                "average_close":
                    round(
                        float(
                            data2["Close"].mean()
                        ),
                        2
                    )
            }
        }

    except Exception as e:

        return {
            "error": str(e)
        }