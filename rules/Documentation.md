# Product Requirement Document

# General:

The app should help consultant show clients how they can use AI in their processes.
It will have different features:

- Process Question: It should answer questions on specific process problems and suggest how to use AI/Robotics/NoCode/LowCode/Programming to automate the process. It can be also a combination of this solutions.
- Canvas: interactive canvas where you can draw a process flow and describe how to automate the process.
- Case Study Library: a searchable database of anonymized case studies, categorized by industry, process type, and automation method (e.g., AI-driven predictive analytics in supply chain management). Users could contribute their own examples, with moderation for quality assurance.
- Simulation and Testing Environment: virtual simulator where users can input process data and run "what-if" scenarios for proposed automations, incorporating elements like AI model training simulations or low-code workflow testing.

# Functionalities in detail

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

The Canvas feature is an interactive, visual workspace that enables consultants to collaboratively design, map, and demonstrate process automation workflows. It provides a drag-and-drop interface for creating process flow diagrams, annotating them with automation opportunities, and simulating how AI, robotics, NoCode/LowCode, or programming solutions can streamline operations. Canvas serves as a dynamic tool for consultants to visually communicate complex automation strategies to clients, fostering engagement and clarity during consultations.

Key Capabilities:

- Process Mapping: Users can create detailed process flowcharts by dragging and dropping nodes representing tasks, decision points, or data inputs. Each node can be customized with descriptions, metrics (e.g., time taken, error rate), and associated roles.
- Automation Annotations: Consultants can tag nodes with recommended automation tools, drawing from Process Question suggestions or the Integration Hub. For example, a node labeled “Manual Data Entry” could be annotated with a suggestion to use an RPA tool like UiPath or a NoCode integration via Zapier.
- Interactive Simulations: Canvas allows users to simulate automated processes, visualizing how changes (e.g., replacing manual steps with AI) impact efficiency, cost, or output. Simulations can incorporate real-time data from integrated tools via the Integration Hub.
- Collaboration Tools: Supports real-time collaboration, enabling multiple users (e.g., consultants and clients) to edit the canvas simultaneously. Features include comment threads, version control, and role-based access to ensure secure teamwork.
- Export and Sharing: Process flows can be exported as professional reports (e.g., PDF, PowerPoint) or interactive dashboards for client presentations. Integration with the Integration Hub allows direct implementation of designed workflows.

Use Case Example:
A consultant maps a client’s order fulfillment process on Canvas, identifying bottlenecks like manual order verification. Using Process Question recommendations, they annotate the verification step with an AI-based fraud detection model and link it to an OpenAI API via the Integration Hub. During a client meeting, the consultant simulates the automated process, showing a 40% reduction in processing time. The finalized flowchart is exported as a PDF for the client’s approval.

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
Website - React
Hosting: Firebase
Backend: Firebase Functions
No SQL DB: Firestore
Authentication: Email / Google Account
Canvas: Draw.io
CSS: Tailwind

The app will have a canvas to draw a simple process.
