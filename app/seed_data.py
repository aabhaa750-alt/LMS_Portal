from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, Course, UnitTopic, TaskAssignment, PersonalNote, StudyGoal


def seed_mba_starter_data(db: Session, user: User) -> dict:
    """
    Populates standard MBA courses, units, topics, and sample tasks
    for a user if they want to explore or initialize their curriculum.
    """
    # Check if user already has courses
    existing_course_count = db.query(Course).filter(Course.user_id == user.id).count()
    if existing_course_count > 0:
        return {"message": "User already has courses. Skipped seeding to avoid duplicates."}

    courses_data = [
        {
            "name": "Managerial Economics",
            "code": "MBA601",
            "description": "Application of microeconomic and macroeconomic theories to business decision-making and market analysis.",
            "instructor": "Prof. David Henderson",
            "academic_year": user.academic_year or "Year 1",
            "semester": user.semester or "Semester 1",
            "color": "#2563eb",  # Blue
            "icon": "trending-up",
            "units": [
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Microeconomic Foundations",
                    "topic_title": "Demand, Supply, and Price Elasticity",
                    "status": "Completed",
                },
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Microeconomic Foundations",
                    "topic_title": "Consumer Choice & Marginal Utility",
                    "status": "In Progress",
                },
                {
                    "unit_number": 2,
                    "unit_title": "Unit 2: Market Structures & Strategy",
                    "topic_title": "Oligopoly, Monopolistic Competition & Game Theory",
                    "status": "Not Started",
                },
                {
                    "unit_number": 3,
                    "unit_title": "Unit 3: Macroeconomic Policy",
                    "topic_title": "Fiscal & Monetary Policy Impacts on Enterprise",
                    "status": "Not Started",
                },
            ]
        },
        {
            "name": "Financial Accounting",
            "code": "MBA602",
            "description": "Financial reporting, balance sheet mechanics, cash flow analysis, and corporate performance measurement.",
            "instructor": "Prof. Catherine Vance",
            "academic_year": user.academic_year or "Year 1",
            "semester": user.semester or "Semester 1",
            "color": "#059669",  # Emerald green
            "icon": "calculator",
            "units": [
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Reporting Mechanics",
                    "topic_title": "Three Financial Statements & Accrual Accounting",
                    "status": "Completed",
                },
                {
                    "unit_number": 2,
                    "unit_title": "Unit 2: Cash Flow Analysis",
                    "topic_title": "Operating, Investing & Financing Cash Flow Modeling",
                    "status": "In Progress",
                },
                {
                    "unit_number": 3,
                    "unit_title": "Unit 3: Ratio Analysis",
                    "topic_title": "Liquidity, Solvency & DuPont Profitability Deconstruction",
                    "status": "Not Started",
                },
            ]
        },
        {
            "name": "Marketing Management",
            "code": "MBA603",
            "description": "Customer centricity, market segmentation, brand positioning, and omnichannel marketing execution.",
            "instructor": "Prof. Marcus Thorne",
            "academic_year": user.academic_year or "Year 1",
            "semester": user.semester or "Semester 1",
            "color": "#d97706",  # Amber
            "icon": "target",
            "units": [
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Strategic Market Analysis",
                    "topic_title": "Customer Value Proposition & STP Framework",
                    "status": "Completed",
                },
                {
                    "unit_number": 2,
                    "unit_title": "Unit 2: Brand & Pricing",
                    "topic_title": "Brand Equity, Pricing Tactics & Customer Lifetime Value (CLV)",
                    "status": "Not Started",
                },
            ]
        },
        {
            "name": "Product Management",
            "code": "MBA604",
            "description": "Product strategy, user empathy, backlog prioritization, MVP experiments, and go-to-market roadmaps.",
            "instructor": "Dr. Sarah Lin",
            "academic_year": user.academic_year or "Year 1",
            "semester": user.semester or "Semester 1",
            "color": "#7c3aed",  # Purple
            "icon": "layers",
            "units": [
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Discovery & User Empathy",
                    "topic_title": "Jobs To Be Done (JTBD) & Problem Discovery",
                    "status": "In Progress",
                },
                {
                    "unit_number": 2,
                    "unit_title": "Unit 2: Execution & Metrics",
                    "topic_title": "North Star Metrics, OKRs & Prioritization Matrices (RICE)",
                    "status": "Not Started",
                },
            ]
        },
        {
            "name": "Statistics & Business Analytics",
            "code": "MBA605",
            "description": "Data-driven decision making, hypothesis testing, regression analysis, and managerial forecasting.",
            "instructor": "Prof. Robert Evans",
            "academic_year": user.academic_year or "Year 1",
            "semester": user.semester or "Semester 1",
            "color": "#0284c7",  # Sky blue
            "icon": "bar-chart-2",
            "units": [
                {
                    "unit_number": 1,
                    "unit_title": "Unit 1: Probability & Estimation",
                    "topic_title": "Statistical Distributions & Confidence Intervals",
                    "status": "In Progress",
                },
                {
                    "unit_number": 2,
                    "unit_title": "Unit 2: Predictive Modeling",
                    "topic_title": "Multiple Linear Regression & Overfitting Diagnostics",
                    "status": "Not Started",
                },
            ]
        },
    ]

    created_courses = []
    created_topics = []

    for c_data in courses_data:
        course = Course(
            user_id=user.id,
            name=c_data["name"],
            code=c_data["code"],
            description=c_data["description"],
            instructor=c_data["instructor"],
            academic_year=c_data["academic_year"],
            semester=c_data["semester"],
            color=c_data["color"],
            icon=c_data["icon"],
        )
        db.add(course)
        db.flush()  # get course.id
        created_courses.append(course)

        for idx, u_data in enumerate(c_data["units"]):
            topic = UnitTopic(
                course_id=course.id,
                user_id=user.id,
                unit_number=u_data["unit_number"],
                unit_title=u_data["unit_title"],
                topic_title=u_data["topic_title"],
                status=u_data["status"],
                order_index=idx,
                completed_at=datetime.utcnow() if u_data["status"] == "Completed" else None
            )
            db.add(topic)
            created_topics.append(topic)

    # Seed 2 realistic MBA tasks
    now = datetime.utcnow()
    econ_course = created_courses[0]
    acct_course = created_courses[1]

    task1 = TaskAssignment(
        user_id=user.id,
        course_id=econ_course.id,
        title="Managerial Economics Case Study: Airline Dynamic Pricing",
        description="Analyze pricing discrimination mechanisms and calculate cross-price elasticity for route network changes.",
        task_type="Assignment",
        due_date=now + timedelta(days=4, hours=6),
        priority="High",
        status="In Progress",
    )
    task2 = TaskAssignment(
        user_id=user.id,
        course_id=acct_course.id,
        title="Financial Statement Analysis Midterm Quiz",
        description="Prepare comprehensive notes on DuPont 3-stage and 5-stage return on equity decomposition.",
        task_type="Exam",
        due_date=now + timedelta(days=9, hours=3),
        priority="Medium",
        status="To Do",
    )
    db.add_all([task1, task2])

    # Seed a starter personal study note
    note = PersonalNote(
        user_id=user.id,
        course_id=econ_course.id,
        title="Core Principles of Price Elasticity (Ped)",
        content="""## Key Takeaways from Lecture 2

### 1. Price Elasticity of Demand formula:
$$\\epsilon_d = \\frac{\\% \\Delta Q}{\\% \\Delta P} = \\frac{\\Delta Q / Q}{\\Delta P / P}$$

- When $|\\epsilon_d| > 1$: Demand is **elastic** (price decreases increase total revenue).
- When $|\\epsilon_d| < 1$: Demand is **inelastic** (essential goods, brand loyalty allows price increases).
- When $|\\epsilon_d| = 1$: Unit elastic (revenue is maximized at the vertex).

### 2. Strategic Implications for MBA Case Studies:
- Differentiated luxury products exhibit low elasticity due to lack of direct substitutes.
- Commodities have high cross-price elasticity.
""",
        tags="economics, lecture-notes, exam-prep"
    )
    db.add(note)

    # Seed study goal for current week
    current_week = f"{now.year}-W{now.isocalendar()[1]:02d}"
    goal = StudyGoal(
        user_id=user.id,
        week_identifier=current_week,
        target_topics=6,
        target_hours=18.0,
        notes="Focus on clearing Managerial Economics Unit 1 and Financial Statements modeling."
    )
    db.add(goal)

    db.commit()
    return {
        "message": f"Successfully loaded {len(created_courses)} MBA courses with {len(created_topics)} study topics, 2 upcoming deadlines, and sample lecture notes.",
        "courses_count": len(created_courses),
        "topics_count": len(created_topics)
    }
