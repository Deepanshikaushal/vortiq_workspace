import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "VortiQ Studio — Technical Tools Mastery & Interview Guide")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "Confidential & Proprietary — VortiQ Studio Prep Guide")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def build_pdf(filename="VortiQ_Studio_Interview_Guide_and_Tools_Mastery.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#6366f1"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#06b6d4"),
        spaceBefore=14,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    q_style = ParagraphStyle(
        'QuestionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#4f46e5"),
        spaceBefore=8,
        spaceAfter=4
    )

    a_style = ParagraphStyle(
        'AnswerStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=8
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f8fafc"),
        borderColor=colors.HexColor("#e2e8f0"),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8
    )

    story = []

    # Title Banner
    story.append(Paragraph("VortiQ Studio", title_style))
    story.append(Paragraph("Technical Tools Mastery & Comprehensive Interview Prep Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366f1"), spaceAfter=15))

    # Overview Box
    overview_text = "<b>Document Purpose:</b> This comprehensive reference guide covers every technology, tool, architecture design pattern, and technical interview question associated with the <b>VortiQ Studio</b> full-stack project (Java 21/24 Spring Boot 3.3 REST API + React 18 Vite Frontend). Use this guide to master interviews and explain your project with 100% technical authority."
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 10))

    # SECTION 1: TOOL-BY-TOOL MASTERY
    story.append(Paragraph("PART 1: Understanding All Tools & Technologies Used", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

    tools_data = [
        ["Technology / Tool", "Role in Project", "Key Concept to Explain in Interviews"],
        ["Java 21 / 24", "Core Backend Programming Language", "Modern JDK features, Strong Typing, OOP Principles, Exception Handling, Streams."],
        ["Spring Boot 3.3", "Enterprise Backend Framework", "Inversion of Control (IoC), Dependency Injection (DI), Auto-configuration, Spring Web MVC."],
        ["Spring Data JPA", "Data Access & Repository Layer", "Object-Relational Mapping (ORM), JpaRepository abstractions, Dynamic Query methods."],
        ["Hibernate ORM", "JPA Implementation Provider", "Entity lifecycle management, DDL auto-generation, `@Entity`, `@Id`, `@Enumerated` mapping."],
        ["H2 Database", "In-Memory Relational DB Engine", "Zero-config persistence, zero external DB dependencies, `jdbc:h2:mem:taskpulsedb`, H2 Web Console."],
        ["Apache Maven 3.9+", "Java Dependency & Build Tool", "`pom.xml`, dependency management lifecycle (`clean`, `compile`, `test`, `package`), spring-boot-maven-plugin."],
        ["React 18", "Frontend User Interface Framework", "Component-driven architecture, Hooks (`useState`, `useEffect`, `useCallback`), State orchestration, Virtual DOM."],
        ["Vite 5", "Frontend Build & Bundling Tool", "Fast HMR (Hot Module Replacement), ES Modules, production bundling into `dist/`, Dev Server proxy."],
        ["Lucide React", "Icon Library", "Scalable SVG vector icon integration for visual UI elements."],
        ["Vanilla CSS & Glassmorphic Design", "Styling & UI Tokens", "CSS Custom Properties (Variables), `backdrop-filter: blur()`, Grid, Flexbox, Keyframe animations."],
        ["Docker & Docker Compose", "Containerization & Cloud Hosting", "Multi-Stage Dockerfile (Node 20 -> Maven 3.9 -> JRE Alpine), lightweight production deployment."],
        ["Git & GitHub", "Version Control & Collaboration", "Repository tracking, `.gitignore` rules, human commit hygiene, remote origin management."]
    ]

    table = Table(tools_data, colWidths=[120, 160, 224])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#ffffff")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 7),
        ('TOPPADDING', (0,0), (-1,0), 7),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,1), (-1,-1), 5),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(table)
    story.append(Spacer(1, 15))

    # SECTION 2: TOP INTERVIEW QUESTIONS & DETAILED ANSWERS
    story.append(Paragraph("PART 2: Comprehensive Technical Interview Questions & Answers", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

    qa_pairs = [
        # JAVA & SPRING BOOT
        ("Q1: How does Spring Boot Inversion of Control (IoC) and Dependency Injection (DI) work in this project?",
         "<b>Answer:</b> In Inversion of Control (IoC), the Spring Container controls the creation and lifecycle of Java objects (Beans) rather than the application creating them with `new`. Dependency Injection (DI) is the pattern used to supply dependencies.<br/><br/>In our project, <b>TaskController</b> requires <b>TaskService</b>, and <b>TaskService</b> requires <b>TaskRepository</b>. Spring automatically injects these dependencies via Constructor Injection:<br/><code>public TaskService(TaskRepository taskRepository) { this.taskRepository = taskRepository; }</code><br/>This promotes loose coupling, high testability, and single responsibility principles."),

        ("Q2: What is the difference between JPA, Hibernate, and Spring Data JPA?",
         "<b>Answer:</b><br/>"
         "• <b>JPA (Jakarta Persistence API):</b> A Java specification/standard defining interfaces and annotations (`@Entity`, `@Id`, `@Table`) for ORM.<br/>"
         "• <b>Hibernate:</b> The concrete ORM implementation of the JPA specification. It generates SQL queries, manages database sessions, and handles schema DDL auto-generation.<br/>"
         "• <b>Spring Data JPA:</b> A data access abstraction layer built on top of JPA/Hibernate. It provides standard repository interfaces (`JpaRepository<Task, Long>`) so developers can execute CRUD operations without writing repetitive boilerplate SQL."),

        ("Q3: How does Spring Boot Auto-Configuration work in `TaskPulseApplication.java`?",
         "<b>Answer:</b> The <code>@SpringBootApplication</code> annotation is a convenience annotation combining three annotations:<br/>"
         "1. <code>@SpringBootConfiguration</code>: Designates the class as a Spring configuration bean.<br/>"
         "2. <code>@EnableAutoConfiguration</code>: Scans classpath JARs (e.g. H2, Spring Web, Hibernate) and auto-configures Tomcat, DispatcherServlet, and DataSource based on default rules.<br/>"
         "3. <code>@ComponentScan</code>: Scans current and child packages for Spring stereotypes (<code>@RestController</code>, <code>@Service</code>, <code>@Repository</code>, <code>@Component</code>)."),

        ("Q4: Explain how CORS is configured in `WebConfig.java` and why it is necessary.",
         "<b>Answer:</b> Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts a webpage on one origin (`localhost:5173`) from making HTTP requests to a server on a different origin (`localhost:8080`).<br/><br/>We configured CORS in <code>WebConfig.java</code> by implementing <code>WebMvcConfigurer</code> and overriding <code>addCorsMappings()</code>:<br/>"
         "<code>registry.addMapping(\"/api/**\").allowedOriginPatterns(\"*\").allowedMethods(\"GET\", \"POST\", \"PUT\", \"PATCH\", \"DELETE\");</code><br/>"
         "This allows the React Vite frontend to perform REST operations without encountering browser cross-origin blocking."),

        ("Q5: What is the purpose of `@Enumerated(EnumType.STRING)` on `TaskStatus` and `TaskPriority`?",
         "<b>Answer:</b> By default, JPA maps Java enums to database columns using <code>EnumType.ORDINAL</code> (storing numeric indices like 0, 1, 2). If an enum value is added or reordered, numeric mapping corrupts database data.<br/><br/>Using <code>@Enumerated(EnumType.STRING)</code> forces JPA to store explicit string literals (e.g. 'IN_PROGRESS', 'URGENT') in database columns, making the database robust, readable, and safe from enum reordering."),

        ("Q6: How does the `@PreUpdate` entity lifecycle hook work in `Task.java`?",
         "<b>Answer:</b> JPA entity lifecycle annotations hook into Hibernate persistence events. In <code>Task.java</code>, the method:<br/>"
         "<code>@PreUpdate public void preUpdate() { this.updatedAt = LocalDateTime.now(); }</code><br/>"
         "is automatically invoked by JPA right before an update SQL query is sent to the database, ensuring `updatedAt` is always synchronized accurately without manual boilerplate code."),

        # REACT & FRONTEND
        ("Q7: How does state management and component communication work in our React frontend?",
         "<b>Answer:</b> Our React application uses top-down state management in <code>App.jsx</code>:<br/>"
         "• <b>Lifting State Up:</b> `App.jsx` holds central state (`tasks`, `stats`, `searchQuery`, `statusFilter`, `activeView`, `toasts`).<br/>"
         "• <b>Props Passing:</b> `App.jsx` passes state down to child components (`Sidebar`, `Navbar`, `MetricsOverview`, `KanbanBoard`, `TaskTable`, `TaskModal`).<br/>"
         "• <b>Callback Props:</b> Child components trigger parent state updates via callback functions passed as props (e.g. `onStatusChange`, `onSaveTask`, `onDeleteTask`)."),

        ("Q8: Why did we use `useCallback` for `loadData()` in `App.jsx`?",
         "<b>Answer:</b> In React, functions defined inside components are recreated on every render. Passing an inline function to `useEffect` dependency arrays causes infinite re-render loops.<br/><br/>Wrapping `loadData` in <code>useCallback(async () => { ... }, [statusFilter, priorityFilter, searchQuery])</code> memoizes the function instance so it is only recreated when one of its actual filter dependencies changes."),

        ("Q9: How does the Vite Proxy configuration in `vite.config.js` work?",
         "<b>Answer:</b> During local development, the React frontend runs on port 5173 and the Spring Boot backend runs on port 8080. In <code>vite.config.js</code>, we configured:<br/>"
         "<code>proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } }</code><br/>"
         "Any request starting with `/api` is transparently proxied by the Vite dev server to Spring Boot, preventing CORS issues during local development."),

        ("Q10: How is Glassmorphism implemented in `index.css`?",
         "<b>Answer:</b> Glassmorphism is achieved using CSS visual effects:<br/>"
         "1. <code>background: rgba(15, 21, 39, 0.7);</code> — Semi-transparent dark background.<br/>"
         "2. <code>backdrop-filter: blur(20px);</code> — Blurs elements underneath the panel.<br/>"
         "3. <code>border: 1px solid rgba(255, 255, 255, 0.08);</code> — Subtle translucent border.<br/>"
         "4. <code>box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.6);</code> — Soft depth shadow."),

        # DEVOPS & PACKAGING
        ("Q11: How does Single-JAR Executable Packaging work for Spring Boot + React?",
         "<b>Answer:</b> We compile the React frontend into static HTML/JS/CSS assets via <code>npm run build</code> (outputting to <code>frontend/dist</code>). We then copy these static assets into <code>backend/src/main/resources/static</code>.<br/><br/>When Maven runs <code>mvn clean package</code>, Spring Boot embeds these static files inside the executable JAR under <code>BOOT-INF/classes/static</code>. Spring Boot's <code>WelcomePageHandlerMapping</code> automatically serves `index.html` as the default root page on port 8080, packaging both frontend and backend into a single executable binary."),

        ("Q12: Explain the multi-stage build process in our production `Dockerfile`.",
         "<b>Answer:</b> Multi-stage Docker builds reduce container size and security vulnerability surfaces:<br/>"
         "• <b>Stage 1 (Node 20 Alpine):</b> Copies `package.json`, installs dependencies, and runs `npm run build` to generate compiled static bundle.<br/>"
         "• <b>Stage 2 (Maven 3.9 + Java 21):</b> Copies Java source code and Stage 1 static bundle into Spring Boot resources, running `mvn clean package` to build the final runnable JAR.<br/>"
         "• <b>Stage 3 (Eclipse Temurin JRE 21 Alpine):</b> Minimal runtime container copying only the output `app.jar` from Stage 2. Discards Node, npm, Maven, and source code, resulting in a lightweight, production-ready image.")
    ]

    for q, a in qa_pairs:
        element_list = [
            Paragraph(q, q_style),
            Paragraph(a, a_style),
            Spacer(1, 4)
        ]
        story.append(KeepTogether(element_list))

    # Summary Box
    story.append(Spacer(1, 10))
    summary_box = [
        Paragraph("<b>💡 Key Elevator Pitch for Your Interview:</b>", h2_style),
        Paragraph("<i>\"VortiQ Studio is an enterprise full-stack task management platform built with Spring Boot 3.3 REST APIs and React 18. I implemented a layered architecture with Spring Data JPA and H2 database, designed a modern glassmorphic UI with drag-and-drop Kanban workflow views, and containerized the application using multi-stage Docker builds and standalone single-JAR executable packaging.\"</i>", body_style)
    ]
    story.append(KeepTogether(summary_box))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    build_pdf()
