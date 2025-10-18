# Product Requirement Document

# General:

The app should help consultant show clients how they can use AI in their processes.
It will have different features:

- Process Question: It should answer questions on specific process problems and suggest how to use AI/Robotics/NoCode/LowCode/Programming to automate the process. It can be also a combination of this solutions.
- Canvas: interactive canvas where you can draw a process flow and describe how to automate the process.
- Case Study Library: a searchable database of anonymized case studies, categorized by industry, process type, and automation method (e.g., AI-driven predictive analytics in supply chain management). Users could contribute their own examples, with moderation for quality assurance.
- Simulation and Testing Environment: virtual simulator where users can input process data and run "what-if" scenarios for proposed automations, incorporating elements like AI model training simulations or low-code workflow testing.

# Functionalities in detail

## Dashboard

There should a dashboard with the list of canvases and researches assigned to own user.

## Process Questions

Description:
The Process Question feature is an intelligent, AI-powered module designed to provide consultants with tailored recommendations for automating business processes. By allowing users to input specific process-related challenges or queries, the system analyzes the input and suggests optimal automation strategies leveraging a combination of AI, robotics, NoCode/LowCode platforms, and custom programming solutions. This functionality serves as a virtual consultant, offering actionable insights to address inefficiencies, reduce costs, or enhance scalability in client workflows.

Key Capabilities:

- Query Analysis: Users submit detailed questions or descriptions of process pain points (e.g., “How can I automate repetitive data entry in our CRM system?”). The system employs natural language processing (NLP) to parse and interpret the query, identifying key process components and constraints.
- Solution Recommendations: The system generates a prioritized list of automation solutions, such as integrating AI for predictive analytics, deploying robotic process automation (RPA) for repetitive tasks, or using NoCode platforms like Zapier for rapid workflow creation. Each recommendation includes a brief explanation of its applicability, estimated implementation effort, and potential benefits (e.g., time savings or error reduction).
- Hybrid Suggestions: Where appropriate, the system proposes hybrid solutions combining multiple technologies (e.g., AI-driven data analysis paired with LowCode workflow automation) to address complex processes holistically.
- Integration with External Tools: Through the Integration Hub, Process Question can pull real-time data from connected platforms (e.g., CRM or ERP systems) to contextualize recommendations, ensuring relevance to the client’s existing tech stack.
- Learning and Customization: The feature adapts to user preferences over time, learning from past queries and feedback to refine suggestions. Consultants can also customize recommendation parameters, such as prioritizing cost-effective solutions or focusing on specific industries.

Use Case Example:
A consultant inputs, “Our client’s inventory management process is slow due to manual stock updates across multiple platforms.” Process Question analyzes the query, identifies integration points (e.g., Shopify, Excel), and suggests:

1. An RPA bot to automate stock updates across platforms.
2. A NoCode workflow using Make to sync data in real-time.
3. An AI model to predict inventory needs based on historical data. The consultant receives a detailed report with implementation steps and links to the Integration Hub for immediate setup.

Technical Foundation:

- Powered by an NLP engine (e.g., leveraging models like BERT or Llama) for query understanding.
- Backed by a knowledge base of automation best practices, populated with industry-specific case studies and updated via continuous learning.
- Integrates with the app’s backend API to fetch data from connected tools, ensuring context-aware recommendations.

Value Proposition:
Process Question empowers consultants to deliver precise, evidence-based automation strategies quickly, reducing research time and enhancing client confidence in proposed solutions.

## Canvas

I want to create an app where users can drag an drop process "boxes" and connect them with arrows. This should bea process documentation software like "SAP Signavio". The twist should be you can add additional information to the boxes if the process step can be full automized with this options: Code, LowCode, NoCode, RPA, AI Agent. Please write me a documentation which I can enter into Curser so AI can build me everything. Framework: NextJS+Tailwind. There should be drag and drop for the process flows and all the needed additional functionalities. Saving into backend, will be done later so here only frontend is needed. The documentation should be very detailed, as every AI execution in Curser cost money

- Drag-and-drop interface for adding process boxes.
- Connecting boxes with directed arrows (edges).
- Editing box properties, including name, description, and selection of an automation option.
- Zooming, panning, and multi-selection on the canvas.
- Undo/redo functionality for diagram changes.
- Export diagram as JSON (for future backend integration) or PNG/SVG.

Technical:

- It should be able to save canvas in no sql DB

Value Proposition:
Canvas transforms abstract automation concepts into tangible, visual workflows, enabling consultants to engage clients effectively, validate solutions through simulations, and streamline the transition from planning to implementation.

## Case Study Library

The Case Study Library is a searchable, curated repository of anonymized case studies that showcase successful implementations of AI, robotics, NoCode/LowCode, and programming solutions in business process automation. Designed to empower consultants, this feature provides real-world examples of how various industries have leveraged automation to address specific process challenges, enhance efficiency, and achieve measurable outcomes. The library serves as a knowledge base, enabling consultants to reference proven strategies, build credibility with clients, and inspire tailored automation recommendations.

Key Capabilities

- Comprehensive Repository: The library contains a diverse collection of case studies, organized by industry (e.g., healthcare, manufacturing, retail), process type (e.g., inventory management, customer support), and automation technology (e.g., AI, RPA, NoCode platforms). Each case study includes a problem statement, the applied solution, implementation steps, and quantifiable results (e.g., 30% cost reduction, 50% faster processing time).
- Search and Filter Functionality: Consultants can search case studies using keywords (e.g., “supply chain automation”) or apply filters for industry, technology, or outcome metrics (e.g., ROI, error reduction). Advanced search options allow combining multiple criteria for precise results.
- Integration with Other Features: Case studies link to the Process Question and Canvas functionalities, enabling consultants to import relevant examples into their workflows. For instance, a case study on AI-driven customer service can inform a Process Question response or be visualized as a flowchart in Canvas.
- User Contributions: Consultants can submit their own case studies, subject to moderation for quality and anonymity. This fosters a community-driven knowledge base, continuously expanding the library with fresh, practical insights.
- Exportable Summaries: Case studies can be exported as concise summaries (e.g., PDF, PowerPoint slides) for inclusion in client presentations, ensuring professional delivery of evidence-based recommendations.
- Analytics Insights: The library aggregates anonymized data from case studies to highlight trends, such as common pain points or high-impact automation strategies across industries, providing consultants with actionable insights to refine their approach.

Use Case Example
A consultant working with a retail client struggling with inventory overstock inputs “inventory management” into the Case Study Library. The system returns a case study detailing how a similar retailer used an AI predictive model integrated with a NoCode platform (via the Integration Hub) to optimize stock levels, reducing waste by 25%. The consultant imports the case study’s process flow into the Canvas for visualization and uses Process Question to generate a customized version of the solution for the client’s specific systems. The case study is then exported as a PDF for a client presentation, reinforcing the recommendation with real-world evidence.
Technical Foundation

Database: Built on a scalable database (e.g., MongoDB or PostgreSQL) to store and index case study data, supporting rapid search and retrieval.  
Search Engine: Utilizes an indexing engine (e.g., Elasticsearch) for full-text search and advanced filtering, ensuring quick access to relevant case studies.  
Frontend Interface: Developed with a modern JavaScript framework (e.g., React, Vue.js) for a responsive, user-friendly interface, with features like tag-based navigation and preview cards for case studies.  
Moderation System: Implements an admin panel for reviewing user-submitted case studies, ensuring quality and compliance with privacy standards (e.g., GDPR for anonymized data).  
Integration: Connects to the Integration Hub to pull real-time data from external tools referenced in case studies (e.g., RPA logs, API outputs), enhancing relevance and interactivity.

Value Proposition
The Case Study Library equips consultants with a powerful resource to substantiate their automation recommendations, drawing on real-world successes to build client trust and accelerate decision-making. By offering searchable, actionable, and exportable case studies, it reduces research time and enhances the credibility of proposed solutions.
Additional Notes

Privacy Compliance: All case studies are anonymized to protect sensitive client data, adhering to global privacy regulations.  
Scalability: The library is designed to grow with user contributions, with automated categorization and tagging to maintain usability.  
Customization: Consultants can bookmark or tag favorite case studies for quick access

## Simulation and Testing Environment

A virtual simulator where users can input process data and run "what-if" scenarios for proposed automations, incorporating elements like AI model training simulations or low-code workflow testing.

Beyond static suggestions, this functionality would allow consultants to showcase potential outcomes, such as efficiency gains or error reductions, in a controlled environment. It promotes interactive demonstrations, helping clients understand risks and advantages.

The simulation should be able to create the JSON for the Canvas and then transfer it to the canvas.

Example: "We at our company, have to create tickets for external consultants to add or remove the role in SAP SU01 for a specific user. The external consultant then asks a key user if he is allowed to do that. With approval he performs the task, informs the requestor and updates or closes the ticket"
Response: The Ai schould suggest how the requestor can interact with a chatbot, who will create a ticket, sends a chat request over teams to the key user asking for approval. After approval he will perform the change and updates the ticket and the requestor. A new canvas with process steps will be created to showcase the AI process.

## User Management

- There should be a login for users.
- Implement a functionality where users can be assigned to teams.
- User should be able to share their workflows and research to other users or temas of users.
- There should be an UI to assign Users to teams. But only Admin user should be able to do that.
- Add a guest login. You can accesss the app, but you cannot save data on the DB or use backanend functionality. You can however call external APIs, like AI.

## Unit Tests

Implement unit tests, that should be executer and be correct by every build.

# Techstack

AI - Open Router
Website - NextJS
Hosting: Firebase
Backend: Firebase Functions
No SQL DB: Firestore
Authentication: Email / Google Account
Canvas: Draw.io
CSS: Tailwind
