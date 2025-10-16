import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Main App Component
const App = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        d3.csv("adult.csv").then(loadedData => {
            // --- Data Cleaning and Preparation ---
            loadedData.forEach(d => {
                d.age = +d.age;
                d['hours.per.week'] = +d['hours.per.week'];
                d['education.num'] = +d['education.num'];
                // Trim whitespace from categorical variables
                d.income = d.income ? d.income.trim() : 'N/A';
                d.education = d.education ? d.education.trim() : 'N/A';
                d.occupation = d.occupation ? d.occupation.trim() : 'N/A';
            });
            setData(loadedData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading or parsing data:", err);
            setError("Could not load the dataset. Please ensure 'adult.csv' is in the 'public' folder.");
            setLoading(false);
        });
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-100 p-4 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Income Analysis Dashboard</h1>
                    <p className="text-gray-600 mt-1">Exploring factors correlated with income levels from the Adult Census Dataset.</p>
                </header>

                {loading && <div className="text-center p-8 bg-white rounded-lg shadow">Loading data...</div>}
                {error && <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg shadow">{error}</div>}
                
                {data && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <ChartContainer title="Overall Income Distribution">
                           <IncomeDistributionChart data={data} />
                       </ChartContainer>
                       <ChartContainer title="High Income Rate by Education Level">
                           <EducationChart data={data} />
                       </ChartContainer>
                       <ChartContainer title="Income Distribution by Age">
                           <AgeChart data={data} />
                       </ChartContainer>
                       <ChartContainer title="Income Distribution by Hours Per Week">
                           <HoursChart data={data} />
                       </ChartContainer>
                       <ChartContainer title="High Income Rate by Occupation" fullWidth={true}>
                           <OccupationChart data={data} />
                       </ChartContainer>
                    </div>
                )}
            </div>
            <Tooltip />
            <Chatbot />
        </div>
    );
};

// --- CHATBOT COMPONENT ---
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Hello! I'm your data guide. Ask me about the charts or for a key insight. Type 'help' to see what I can answer." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatBodyRef = useRef(null);

    // Scroll to bottom of chat on new message
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);
    
    // --- BOT'S KNOWLEDGE BASE ---
    // This is where you can add more questions and answers.
    const getBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase().trim();

        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hi there! How can I help you understand this data?";
        }
        if (lowerInput.includes('help')) {
            return "You can ask me things like: 'Explain the age chart', 'What does the education chart show?', 'Tell me about the occupation data', or 'Give me a key takeaway'.";
        }
        if (lowerInput.includes('age')) {
            return "The 'Income Distribution by Age' chart is a box plot. It shows that the median age for individuals earning >$50K is higher than for those earning <=$50K. The box represents the middle 50% of people in each group.";
        }
        if (lowerInput.includes('education')) {
            return "The 'High Income Rate by Education Level' bar chart shows the percentage of people at each education level who earn >$50K. There is a strong trend: more education is highly correlated with a higher income rate.";
        }
        if (lowerInput.includes('hours')) {
            return "The 'Income Distribution by Hours Per Week' chart shows that while both groups have a median of 40 hours/week, the range for high-income earners is wider, suggesting many work more than 40 hours.";
        }
        if (lowerInput.includes('occupation')) {
            return "The 'High Income Rate by Occupation' chart ranks jobs by the percentage of workers earning >$50K. 'Exec-managerial' and 'Prof-specialty' roles have the highest rates of high-income earners.";
        }
        if (lowerInput.includes('takeaway') || lowerInput.includes('insight') || lowerInput.includes('summary')) {
            return "A key insight is that factors like higher education (Bachelors, Masters, Doctorate) and occupation type (managerial or professional specialty) are much stronger predictors of earning over $50K than age or hours worked alone.";
        }

        return "I'm sorry, I'm not sure how to answer that. You can ask me to explain a specific chart or give you a key insight. Type 'help' for examples.";
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        
        const botResponseText = getBotResponse(inputValue);
        const botMessage = { sender: 'bot', text: botResponseText };

        setTimeout(() => {
            setMessages(prev => [...prev, botMessage]);
        }, 500); // Simulate bot thinking

        setInputValue('');
    };

    return (
        <>
            {/* Chat bubble button */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-5 right-5 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col transition-all z-50">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 bg-blue-500 text-white rounded-t-lg">
                        <h3 className="font-semibold">Data Guide</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                                <div className={`py-2 px-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-200 text-gray-800' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-lg">
                        <div className="flex">
                            <input 
                                type="text"
                                placeholder="Ask a question..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button type="submit" className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600">Send</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};


// Generic Chart Container
const ChartContainer = ({ title, children, fullWidth = false }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-xl ${fullWidth ? 'lg:col-span-2' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <div>{children}</div>
    </div>
);

// Tooltip Component
const Tooltip = () => (
    <div id="tooltip" className="absolute text-center p-2 text-sm bg-gray-800 text-white rounded-md pointer-events-none opacity-0 transition-opacity duration-200 z-10"></div>
);

// --- D3 Chart Components ---

// Chart 1: Income Distribution (Pie Chart)
const IncomeDistributionChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data) return;

        const incomeCounts = d3.rollup(data, v => v.length, d => d.income);
        const incomeData = Array.from(incomeCounts, ([key, value]) => ({ key, value }));
        
        const width = 300, height = 300, margin = 20;
        const radius = Math.min(width, height) / 2 - margin;
        
        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .html("") // Clear previous renders
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal().domain(incomeData.map(d => d.key)).range(["#60a5fa", "#f472b6"]); // Changed orange to pink
        const pie = d3.pie().value(d => d.value);
        const data_ready = pie(incomeData);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const tooltip = d3.select("#tooltip");

        svg.selectAll('path')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.key))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", () => tooltip.style("opacity", 1))
            .on("mousemove", (event, d) => {
                const total = d3.sum(incomeData, d => d.value);
                const percent = (d.data.value / total * 100).toFixed(1);
                tooltip.html(`<b>${d.data.key}</b><br>${d.data.value.toLocaleString()} individuals<br>(${percent}%)`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

    }, [data]);

    return <svg ref={svgRef}></svg>;
};

// Chart 2: Education vs. Income
const EducationChart = ({ data }) => {
    const svgRef = useRef();
    
    useEffect(() => {
        if (!data) return;
        
        const educationGroups = d3.group(data, d => d.education);
        let educationRates = Array.from(educationGroups, ([education, values]) => {
            const total = values.length;
            const highIncome = values.filter(d => d.income === '>50K').length;
            return { education, rate: highIncome / total, total, educationNum: values[0]['education.num'] };
        }).sort((a, b) => a.educationNum - b.educationNum);

        const margin = {top: 20, right: 30, bottom: 120, left: 60};
        const width = 500 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .html("")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().range([0, width]).domain(educationRates.map(d => d.education)).padding(0.2);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))
            .selectAll("text").attr("transform", "translate(-10,0)rotate(-45)").style("text-anchor", "end").style("font-size", "12px");

        const y = d3.scaleLinear().domain([0, d3.max(educationRates, d => d.rate)]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%"))).style("font-size", "12px");
        
        const tooltip = d3.select("#tooltip");

        svg.selectAll("rect")
            .data(educationRates)
            .enter()
            .append("rect")
            .attr("x", d => x(d.education))
            .attr("y", d => y(d.rate))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.rate))
            .attr("fill", "#60a5fa")
            .on("mouseover", () => tooltip.style("opacity", 1))
            .on("mousemove", (event, d) => {
                tooltip.html(`<b>${d.education}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%<br>(${d.total.toLocaleString()} individuals)`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

    }, [data]);

    return <svg ref={svgRef}></svg>;
};

// Chart 3: Age Distribution (Box Plot)
const AgeChart = ({ data }) => {
    const svgRef = useRef();
    
    useEffect(() => {
        if (!data) return;

        const margin = {top: 20, right: 30, bottom: 50, left: 60};
        const width = 500 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .html("")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const y = d3.scaleBand().range([height, 0]).domain(["<=50K", ">50K"]).padding(.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

        const x = d3.scaleLinear().domain([15, 95]).range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).style("font-size", "12px");
        
        svg.append("text").attr("text-anchor", "end").attr("x", width).attr("y", height + margin.top + 20).text("Age").style("font-size", "12px");

        const sumstat = d3.rollup(data, d => {
            const q1 = d3.quantile(d.map(g => g.age).sort(d3.ascending), .25);
            const median = d3.quantile(d.map(g => g.age).sort(d3.ascending), .5);
            const q3 = d3.quantile(d.map(g => g.age).sort(d3.ascending), .75);
            const min = d3.min(d, g => g.age);
            const max = d3.max(d, g => g.age);
            return {q1, median, q3, min, max};
        }, d => d.income);

        const sumstatArray = Array.from(sumstat, ([key, value]) => ({ key, value }));

        svg.selectAll("vertLines").data(sumstatArray).enter().append("line")
            .attr("y1", d => y(d.key) + y.bandwidth() / 2).attr("y2", d => y(d.key) + y.bandwidth() / 2)
            .attr("x1", d => x(d.value.min)).attr("x2", d => x(d.value.max))
            .attr("stroke", "black").style("width", 40);

        svg.selectAll("boxes").data(sumstatArray).enter().append("rect")
            .attr("y", d => y(d.key)).attr("x", d => x(d.value.q1))
            .attr("width", d => (x(d.value.q3) - x(d.value.q1)))
            .attr("height", y.bandwidth()).attr("stroke", "black").style("fill", "#60a5fa");
        
        svg.selectAll("medianLines").data(sumstatArray).enter().append("line")
            .attr("y1", d => y(d.key)).attr("y2", d => y(d.key) + y.bandwidth())
            .attr("x1", d => x(d.value.median)).attr("x2", d => x(d.value.median))
            .attr("stroke", "black").style("width", 80);

    }, [data]);
    
    return <svg ref={svgRef}></svg>;
};

// Chart 4: Hours Per Week Distribution (Box Plot)
const HoursChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data) return;

        const margin = {top: 20, right: 30, bottom: 50, left: 60};
        const width = 500 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .html("")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const y = d3.scaleBand().range([height, 0]).domain(["<=50K", ">50K"]).padding(.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

        const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).style("font-size", "12px");

        svg.append("text").attr("text-anchor", "end").attr("x", width).attr("y", height + margin.top + 20).text("Hours Per Week").style("font-size", "12px");

        const sumstat = d3.rollup(data, d => {
            const q1 = d3.quantile(d.map(g => g['hours.per.week']).sort(d3.ascending), .25);
            const median = d3.quantile(d.map(g => g['hours.per.week']).sort(d3.ascending), .5);
            const q3 = d3.quantile(d.map(g => g['hours.per.week']).sort(d3.ascending), .75);
            return ({q1, median, q3, min: d3.min(d, g => g['hours.per.week']), max: d3.max(d, g => g['hours.per.week'])});
        }, d => d.income);

        const sumstatArray = Array.from(sumstat, ([key, value]) => ({ key, value }));

        svg.selectAll("vertLines").data(sumstatArray).enter().append("line")
            .attr("y1", d => y(d.key) + y.bandwidth() / 2).attr("y2", d => y(d.key) + y.bandwidth() / 2)
            .attr("x1", d => x(d.value.min)).attr("x2", d => x(d.value.max))
            .attr("stroke", "black").style("width", 40);

        svg.selectAll("boxes").data(sumstatArray).enter().append("rect")
            .attr("y", d => y(d.key)).attr("x", d => x(d.value.q1))
            .attr("width", d => (x(d.value.q3) - x(d.value.q1)))
            .attr("height", y.bandwidth()).attr("stroke", "black").style("fill", "#f472b6"); // Changed orange to pink
        
        svg.selectAll("medianLines").data(sumstatArray).enter().append("line")
            .attr("y1", d => y(d.key)).attr("y2", d => y(d.key) + y.bandwidth())
            .attr("x1", d => x(d.value.median)).attr("x2", d => x(d.value.median))
            .attr("stroke", "black").style("width", 80);

    }, [data]);
    
    return <svg ref={svgRef}></svg>;
};


// Chart 5: High Income Rate by Occupation
const OccupationChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data) return;

        const occupationData = data.filter(d => d.occupation && d.occupation !== '?');
        const occupationGroups = d3.group(occupationData, d => d.occupation);
        let occupationRates = Array.from(occupationGroups, ([occupation, values]) => {
            const total = values.length;
            const highIncome = values.filter(d => d.income === '>50K').length;
            return { occupation, rate: highIncome / total, total };
        }).sort((a, b) => b.rate - a.rate);

        const margin = {top: 20, right: 30, bottom: 40, left: 120};
        const width = 1000 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .html("")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const y = d3.scaleBand().range([0, height]).domain(occupationRates.map(d => d.occupation)).padding(0.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

        const x = d3.scaleLinear().domain([0, d3.max(occupationRates, d => d.rate)]).range([0, width]);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format(".0%"))).style("font-size", "12px");

        const tooltip = d3.select("#tooltip");

        svg.selectAll("rect").data(occupationRates).enter().append("rect")
            .attr("y", d => y(d.occupation)).attr("x", 0).attr("width", d => x(d.rate))
            .attr("height", y.bandwidth()).attr("fill", "#818cf8")
            .on("mouseover", () => tooltip.style("opacity", 1))
            .on("mousemove", (event, d) => {
                tooltip.html(`<b>${d.occupation}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%<br>(${d.total.toLocaleString()} individuals)`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
            
    }, [data]);
    
    return <svg ref={svgRef}></svg>;
};

export default App;

