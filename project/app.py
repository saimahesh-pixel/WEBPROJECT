import matplotlib
matplotlib.use("Agg")

from flask import Flask, render_template, request, jsonify
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

def generate_plot(distribution, plot_type, params=None):
    x = np.linspace(-10, 10, 400)
    fig, ax = plt.subplots(figsize=(7, 5))

    if params is None:
        params = {}

    if distribution == "exponential":
        rate = float(params.get("rate", 1.0))  # rate parameter (lambda)
        x = np.linspace(0, 10, 400)  # exponential is only defined for x >= 0
        y_pdf = rate * np.exp(-rate * x)
        y_pdf[x < 0] = 0
        y_samples = np.random.exponential(1/rate, 1000)

    elif distribution == "uniform":
        a = float(params.get("a", -10))  # lower bound
        b = float(params.get("b", 10))   # upper bound
        x = np.linspace(a-1, b+1, 400)
        y_pdf = np.ones_like(x) / (b - a)
        y_pdf[x < a] = 0
        y_pdf[x > b] = 0
        y_samples = np.random.uniform(a, b, 1000)

    elif distribution == "rayleigh":
        scale = float(params.get("scale", 2))
        y_pdf = (x / (scale**2)) * np.exp(-x**2 / (2*scale**2))
        y_pdf[x < 0] = 0
        y_samples = np.random.rayleigh(scale, 1000)

    elif distribution == "binomial":
        n = int(params.get("n", 20))     # number of trials
        p = float(params.get("p", 0.5))  # probability
        x = np.arange(0, n+1)
        y_samples = np.random.binomial(n, p, 1000)
        y_pdf = x

    elif distribution == "poisson":
        lam = float(params.get("lambda", 5))  # rate parameter
        x = np.arange(0, max(20, int(2*lam)))
        y_samples = np.random.poisson(lam, 1000)
        y_pdf = np.array(y_samples)
        y_samples = x

    elif distribution == "laplacian":
        loc = float(params.get("location", 0))
        scale = float(params.get("scale", 2))
        y_pdf = (1/(2*scale)) * np.exp(-np.abs(x - loc)/scale)
        y_samples = np.random.laplace(loc, scale, 1000)

    elif distribution == "gaussian":
        mean = float(params.get("mean", 0))
        std_dev = float(params.get("std", 1))
        y_pdf = (1 / (std_dev * np.sqrt(2 * np.pi))) * np.exp(-((x - mean) ** 2) / (2 * std_dev ** 2))
        y_samples = np.random.normal(mean, std_dev, 1000)

    else:
        return None 

    if plot_type == "density" and y_pdf is not None:
        ax.plot(x, y_pdf, label=f"{distribution.capitalize()} PDF", color="b")

    elif plot_type == "distribution":
        ax.plot(sorted(y_samples), np.linspace(0, 1, len(y_samples)), label=f"{distribution.capitalize()} CDF", color="g")

    elif plot_type == "both":
        if y_pdf is not None:
            ax.plot(x, y_pdf, label=f"{distribution.capitalize()} PDF", color="b")
        ax.plot(sorted(y_samples), np.linspace(0, 1, len(y_samples)), label=f"{distribution.capitalize()} CDF", color="g")

    ax.legend()
    ax.set_xlabel("X")
    ax.set_ylabel("Probability Density")
    ax.set_title(f"{distribution.capitalize()} {plot_type.capitalize()} Plot")
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def validate_params(distribution, params):
    if distribution == "binomial":
        p = float(params.get("p", 0.5))
        n = int(params.get("n", 20))
        if p < 0 or p > 1:
            return False, "Probability (p) must be between 0 and 1"
        if n < 0:
            return False, "Number of trials (n) must be non-negative"
    return True, ""

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/get_pdf', methods=['POST'])
def get_pdf():
    data = request.json
    distribution = data.get("distribution", "").lower()
    plot_type = data.get("plotType", "").lower()
    params = data.get("params", {})

    # Validate parameters
    valid, error_message = validate_params(distribution, params)
    if not valid:
        return jsonify({"error": error_message})
    
    image_data = generate_plot(distribution, plot_type, params)
    if image_data:
        return jsonify({"image": image_data})
    return jsonify({"error": "Invalid selection!"})

if __name__ == '__main__':
    app.run(debug=True)
