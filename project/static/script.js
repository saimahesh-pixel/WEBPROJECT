<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Probability Distribution Visualizer</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            text-align: center;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 12px;
            width: 60%;
            margin-bottom: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        select, button {
            font-size: 16px;
            padding: 10px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        select {
            background: white;
            color: #333;
        }

        button {
            background: #ff4081;
            color: white;
            font-weight: bold;
        }

        button:hover {
            background: #e91e63;
            transform: scale(1.05);
        }

        /* Robot Styling */
        .robot-container {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 60%;
            margin-bottom: 20px;
            position: relative;
        }

        .robot {
            width: 100px;
            height: 120px;
            background: #ffcc00;
            border-radius: 20px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }

        .eyes {
            display: flex;
            justify-content: space-between;
            width: 60%;
            position: absolute;
            top: 20px;
        }

        .eye {
            width: 12px;
            height: 12px;
            background: black;
            border-radius: 50%;
        }

        .mouth {
            width: 30px;
            height: 8px;
            background: black;
            position: absolute;
            bottom: 15px;
            border-radius: 4px;
            transition: transform 0.3s ease;
        }

        /* Robot Hands */
        .hand {
            width: 15px;
            height: 40px;
            background: #ffcc00;
            position: absolute;
            top: 40px;
            border-radius: 5px;
            transition: transform 0.3s ease;
        }

        .hand.left {
            left: -20px;
        }

        .hand.right {
            right: -20px;
        }

        /* Speech Bubble */
        .speech-bubble {
            position: absolute;
            left: 120px;
            top: 0;
            background: white;
            color: black;
            padding: 10px 15px;
            border-radius: 10px;
            display: none;
            font-size: 14px;
        }

        .speech-bubble:after {
            content: "";
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: transparent white transparent transparent;
        }

        .show-bubble {
            display: block;
        }

        /* Listening Animation */
        .listening .mouth {
            animation: talking 0.5s infinite alternate;
        }

        .listening .hand.left {
            transform: translateX(10px) rotate(-30deg);
        }

        @keyframes talking {
            from { transform: scaleY(1); }
            to { transform: scaleY(1.8); }
        }

        /* Microphone Button */
        #micButton {
            background: #ff9800;
            padding: 15px;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            margin-left: 20px;
        }

        #micButton:hover {
            background: #e65100;
        }

    </style>
</head>
<body>

    <h2>🎲 Probability Distribution Visualizer 🎲</h2>
    
    <div class="container">
        <label for="distribution">Choose Distribution:</label>
        <select id="distribution">
            <option value="gaussian">Gaussian</option>
            <option value="uniform">Uniform</option>
            <option value="rayleigh">Rayleigh</option>
            <option value="binomial">Binomial</option>
            <option value="poisson">Poisson</option>
            <option value="laplacian">Laplacian</option>
        </select>

        <label for="plotType">Choose Plot Type:</label>
        <select id="plotType">
            <option value="density">Density (PDF)</option>
            <option value="distribution">Distribution (Histogram)</option>
            <option value="both">Both</option>
        </select>

        <button onclick="generatePlot()">📊 Generate Plot</button>
    </div>

    <div class="robot-container">
        <div class="robot" id="robot">
            <div class="eyes">
                <div class="eye"></div>
                <div class="eye"></div>
            </div>
            <div class="mouth" id="robotMouth"></div>
            <div class="hand left"></div>
            <div class="hand right"></div>
            <div class="speech-bubble" id="speechBubble"></div>
        </div>
        <button id="micButton" onclick="startListening()">🎤</button>
    </div>

    <div class="plot-container">
        <h3>Plot Output:</h3>
        <img id="plot" src="" alt="Generated Plot Will Appear Here">
    </div>

    <script>
        function generatePlot() {
    const distribution = document.getElementById("distribution").value;
    const plotType = document.getElementById("plotType").value;

    fetch("/get_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distribution, plotType })
    })
    .then(response => response.json())
    .then(data => {
        if (data.image) {
            document.getElementById("plot").src = "data:image/png;base64," + data.image;
        } else {
            alert("Invalid selection! Please try again.");
        }
    });
}

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const micButton = document.getElementById("micButton");
    const robot = document.getElementById("robot");
    const hand = document.querySelector(".hand.left");
    const speechBubble = document.getElementById("speechBubble");

    recognition.lang = "en-US";
    recognition.start();
    micButton.classList.add("listening");
    hand.classList.add("listening");

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        micButton.classList.remove("listening");
        hand.classList.remove("listening");

        speechBubble.classList.add("show-bubble");
        speechBubble.innerText = `"${speechResult}"`;

        // Auto-select the recognized distribution
        let selectedDist = "";
        if (speechResult.includes("gaussian") || speechResult.includes("normal")) {
            selectedDist = "gaussian";
        } else if (speechResult.includes("uniform")) {
            selectedDist = "uniform";
        } else if (speechResult.includes("rayleigh")) {
            selectedDist = "rayleigh";
        } else if (speechResult.includes("binomial")) {
            selectedDist = "binomial";
        } else if (speechResult.includes("poisson")) {
            selectedDist = "poisson";
        } else if (speechResult.includes("laplacian")) {
            selectedDist = "laplacian";
        }

        if (selectedDist) {
            document.getElementById("distribution").value = selectedDist;
            generatePlot(); // Automatically plot graph
        } else {
            speechBubble.innerText = `"${speechResult}" not recognized`;
        }
    };

    recognition.onerror = function(event) {
        alert("Speech recognition error: " + event.error);
        micButton.classList.remove("listening");
        hand.classList.remove("listening");
    };
}


        function startListening() {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            const robot = document.getElementById("robot");
            const hand = document.querySelector(".hand.left");
            const speechBubble = document.getElementById("speechBubble");

            recognition.lang = "en-US";
            recognition.start();
            robot.classList.add("listening");
            hand.classList.add("listening");

            recognition.onresult = function(event) {
                const speechResult = event.results[0][0].transcript.toLowerCase();
                speechBubble.classList.add("show-bubble");
                speechBubble.innerText = `"${speechResult}"`;
                robot.classList.remove("listening");
                hand.classList.remove("listening");

                const validDistributions = ["gaussian", "uniform", "rayleigh", "binomial", "poisson", "laplacian"];
                let recognizedDistribution = validDistributions.find(d => speechResult.includes(d));
                
                if (recognizedDistribution) {
                    document.getElementById("distribution").value = recognizedDistribution;
                    generatePlot();
                } else {
                    alert("Could not recognize distribution. Try again!");
                }
            };
        }
    </script>

</body>
</html>
