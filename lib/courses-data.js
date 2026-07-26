// Static seed data — single source of truth for the catalog
export const CATEGORIES = [
  { slug: 'sap', name: 'SAP', icon: '🏢', color: 'from-blue-500 to-cyan-500', count: 12 },
  { slug: 'sap-cpi', name: 'SAP CPI', icon: '🔗', color: 'from-indigo-500 to-blue-500', count: 6 },
  { slug: 'sap-btp', name: 'SAP BTP', icon: '☁️', color: 'from-sky-500 to-blue-600', count: 5 },
  { slug: 'ai', name: 'AI & GenAI', icon: '🧠', color: 'from-purple-500 to-pink-500', count: 18 },
  { slug: 'python', name: 'Python', icon: '🐍', color: 'from-yellow-500 to-orange-500', count: 15 },
  { slug: 'react', name: 'React', icon: '⚛️', color: 'from-cyan-400 to-blue-500', count: 10 },
  { slug: 'aws', name: 'AWS', icon: '☁️', color: 'from-orange-500 to-yellow-500', count: 14 },
  { slug: 'azure', name: 'Azure', icon: '🔷', color: 'from-blue-600 to-indigo-600', count: 9 },
  { slug: 'devops', name: 'DevOps', icon: '⚙️', color: 'from-green-500 to-emerald-500', count: 11 },
  { slug: 'data-engineering', name: 'Data Engineering', icon: '📊', color: 'from-pink-500 to-rose-500', count: 8 },
  { slug: 'ml', name: 'Machine Learning', icon: '🤖', color: 'from-violet-500 to-purple-500', count: 12 },
  { slug: 'cybersecurity', name: 'Cyber Security', icon: '🔒', color: 'from-red-500 to-orange-500', count: 7 },
]

const mkLesson = (id, title, duration, free = false, type = 'video') => ({
  id, title, duration, free, type,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  transcript: `In this lesson we cover ${title}. You'll learn the fundamentals, best practices, and see practical examples. By the end of this module you'll be able to apply these concepts in real-world scenarios.`,
  resources: [
    { name: 'Lesson Slides.pdf', size: '2.4 MB', type: 'pdf' },
    { name: 'Source Code.zip', size: '1.1 MB', type: 'zip' },
    { name: 'Cheat Sheet.pdf', size: '480 KB', type: 'pdf' },
  ]
})

const mkCurriculum = (modules) => modules.map((m, i) => ({
  id: `m${i+1}`,
  title: m.title,
  lessons: m.lessons.map((l, j) => mkLesson(`m${i+1}l${j+1}`, l[0], l[1], l[2] || (i===0 && j<2)))
}))

export const COURSES = [
  {
    slug: 'sap-cpi-integration-mastery',
    title: 'SAP CPI Integration Suite — Complete Mastery',
    subtitle: 'Build enterprise integrations end-to-end with real corporate scenarios',
    category: 'sap-cpi', categoryName: 'SAP CPI',
    level: 'Intermediate', language: 'English',
    duration: '38h', lectures: 96, students: 4820, rating: 4.9, reviews: 812,
    price: 149, originalPrice: 349, discount: 57,
    thumbnail: 'https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxkZXZlbG9wZXIlMjBjb2Rpbmd8ZW58MHx8fGJsdWV8MTc4NTA0NTcxMnww&ixlib=rb-4.1.0&q=85',
    banner: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2Rpbmd8ZW58MHx8fGJsdWV8MTc4NTA0NTcxMnww&ixlib=rb-4.1.0&q=85',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Bestseller', 'Live Batches'],
    badge: 'Bestseller',
    description: 'The most comprehensive SAP Cloud Platform Integration course. Master iFlows, adapters, mapping, security, error handling, and enterprise integration patterns. Built by architects for architects.',
    whatYouLearn: [
      'Design and deploy enterprise iFlows on SAP Integration Suite',
      'Master all major adapters: HTTPS, SFTP, IDoc, SOAP, OData, JDBC',
      'Implement message mapping, groovy scripting, and content modifiers',
      'Apply OAuth 2.0, certificate-based auth, and security policies',
      'Debug, monitor, and optimize integration flows in production',
      'Integrate S/4HANA, SuccessFactors, Ariba, and 3rd-party systems',
      'Handle errors, retries, and dead-letter queues professionally',
      'Design for scale — throughput, parallelism, and observability',
    ],
    skills: ['SAP CPI', 'Integration Suite', 'iFlow Design', 'Groovy', 'Message Mapping', 'OAuth 2.0', 'S/4HANA'],
    instructor: { name: 'Rajesh Kumar', title: 'Principal SAP Integration Architect', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4.9, students: 28400, courses: 8, bio: '18 years architecting SAP integrations for Fortune 500 companies. Ex-SAP Labs.' },
    curriculum: mkCurriculum([
      { title: 'Getting Started with SAP Integration Suite', lessons: [['Introduction & Course Roadmap','8:12'],['Tenant Provisioning & Setup','14:20'],['Integration Suite UI Deep Dive','18:44']] },
      { title: 'Building Your First iFlow', lessons: [['Sender & Receiver Adapters','22:10'],['Message Processing Steps','28:35'],['Testing with Postman','15:50'],['Deployment & Monitoring','19:22']] },
      { title: 'Advanced Mapping & Scripting', lessons: [['Message Mapping Techniques','32:18'],['Groovy Script Essentials','41:22'],['Content Modifier Patterns','24:30'],['XSLT Transformations','28:14']] },
      { title: 'Security & Authentication', lessons: [['OAuth 2.0 in CPI','35:20'],['Certificate Management','22:40'],['Encryption & Signing','26:15']] },
      { title: 'Real-World Integration Scenarios', lessons: [['S/4HANA to Salesforce','48:20'],['SuccessFactors Employee Sync','52:10'],['Ariba PO Automation','44:00']] },
      { title: 'Error Handling & Monitoring', lessons: [['Exception Subprocesses','28:15'],['JMS Queues & Retry Logic','32:44'],['Splunk & Alerting','24:10']] },
    ])
  },
  {
    slug: 'aws-solutions-architect-pro',
    title: 'AWS Solutions Architect Professional — 2025',
    subtitle: 'Design fault-tolerant cloud architectures & pass the SAP-C02',
    category: 'aws', categoryName: 'AWS',
    level: 'Advanced', language: 'English',
    duration: '52h', lectures: 128, students: 18240, rating: 4.8, reviews: 3420,
    price: 129, originalPrice: 299, discount: 57,
    thumbnail: 'https://images.unsplash.com/photo-1665211097563-163d6be45d67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwzfHxkZXZlbG9wZXIlMjBjb2Rpbmd8ZW58MHx8fGJsdWV8MTc4NTA0NTcxMnww&ixlib=rb-4.1.0&q=85',
    banner: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Popular', 'Certification'], badge: 'Popular',
    description: 'The gold-standard AWS SA Pro prep. Deep-dive into VPC design, high availability, security, cost optimization, and hybrid architectures — with 12 mock exams.',
    whatYouLearn: ['Design multi-region VPC topologies','Implement zero-downtime migrations','Master IAM, KMS, GuardDuty & Security Hub','Optimize costs with Savings Plans & Compute Optimizer','Architect event-driven systems with EventBridge & Step Functions','Pass the SAP-C02 with confidence'],
    skills: ['AWS','VPC','EC2','Lambda','CloudFormation','IAM','Route53','Well-Architected'],
    instructor: { name: 'Priya Sharma', title: 'AWS Community Hero · 6x Certified', avatar: 'https://i.pravatar.cc/150?img=47', rating: 4.9, students: 62000, courses: 14, bio: 'Ex-AWS Solutions Architect. Trained 50,000+ engineers worldwide.' },
    curriculum: mkCurriculum([
      { title: 'Foundations & Well-Architected Framework', lessons: [['Course Overview','6:30'],['5 Pillars Deep Dive','24:12'],['Shared Responsibility Model','18:40']] },
      { title: 'Networking & VPC Design', lessons: [['VPC Architecture Patterns','42:18'],['Transit Gateway','28:20'],['Direct Connect & Hybrid','34:12'],['PrivateLink','22:40']] },
      { title: 'Compute & Serverless', lessons: [['EC2 Advanced','38:15'],['Lambda Patterns','32:22'],['ECS vs EKS vs Fargate','44:10']] },
      { title: 'Storage & Databases', lessons: [['S3 Advanced','28:20'],['RDS Multi-AZ & Read Replicas','32:18'],['DynamoDB Global Tables','40:22']] },
      { title: 'Security & Compliance', lessons: [['IAM Deep Dive','38:44'],['KMS & Encryption','28:20'],['GuardDuty & Security Hub','24:10']] },
      { title: 'SAP-C02 Exam Prep', lessons: [['Exam Strategy','18:20'],['6 Full Mock Exams','120:00'],['Question Breakdowns','58:30']] },
    ])
  },
  {
    slug: 'genai-llm-engineering',
    title: 'GenAI & LLM Engineering — Build Production AI Apps',
    subtitle: 'From RAG pipelines to agentic workflows with GPT, Claude & Gemini',
    category: 'ai', categoryName: 'AI & GenAI',
    level: 'Intermediate', language: 'English',
    duration: '32h', lectures: 84, students: 12500, rating: 4.9, reviews: 2180,
    price: 179, originalPrice: 399, discount: 55,
    thumbnail: 'https://images.pexels.com/photos/7689766/pexels-photo-7689766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    banner: 'https://images.pexels.com/photos/1181394/pexels-photo-1181394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['New','Trending'], badge: 'New',
    description: 'Master the full GenAI stack — prompt engineering, RAG, vector databases, agentic frameworks, evaluation, and deploying production LLM apps.',
    whatYouLearn: ['Build production RAG systems with pgvector & Pinecone','Design multi-agent workflows with LangGraph & CrewAI','Fine-tune open LLMs with LoRA/QLoRA','Implement guardrails, evals, and observability','Ship AI apps with Next.js, FastAPI & Vercel AI SDK','Optimize cost & latency across GPT-5, Claude 4.5, Gemini 3'],
    skills: ['LLMs','RAG','LangChain','Vector DBs','Prompt Engineering','Fine-Tuning','AI Agents'],
    instructor: { name: 'Dr. Aditya Menon', title: 'ML Engineer · Ex-DeepMind', avatar: 'https://i.pravatar.cc/150?img=33', rating: 4.9, students: 34500, courses: 6, bio: 'PhD in NLP from Stanford. Published in NeurIPS & ACL. Building AI products since 2018.' },
    curriculum: mkCurriculum([
      { title: 'LLM Fundamentals', lessons: [['Transformer Architecture','32:20'],['Tokenization & Embeddings','24:15'],['Modern LLM Landscape 2025','18:40']] },
      { title: 'Prompt Engineering Mastery', lessons: [['Zero/Few Shot Techniques','22:10'],['Chain of Thought & ReAct','28:30'],['Structured Outputs','20:15']] },
      { title: 'RAG Systems', lessons: [['Vector DBs Compared','34:22'],['Chunking Strategies','26:40'],['Hybrid Search','32:18'],['Advanced RAG Patterns','44:20']] },
      { title: 'Agentic AI', lessons: [['LangGraph Fundamentals','38:20'],['Multi-Agent Systems','42:44'],['Tool Use & Function Calling','30:20']] },
      { title: 'Production Deployment', lessons: [['Evals & Guardrails','32:22'],['Cost Optimization','24:18'],['Deploying on Vercel','28:15']] },
    ])
  },
  {
    slug: 'react-nextjs-fullstack',
    title: 'React & Next.js 15 — The Complete Full-Stack Course',
    subtitle: 'Ship production apps with Server Components, Actions & Turbopack',
    category: 'react', categoryName: 'React',
    level: 'All Levels', language: 'English',
    duration: '42h', lectures: 118, students: 24800, rating: 4.8, reviews: 5240,
    price: 89, originalPrice: 199, discount: 55,
    thumbnail: 'https://images.unsplash.com/photo-1541178735493-479c1a27ed24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8Ymx1ZXwxNzg1MDQ1NzEyfDA&ixlib=rb-4.1.0&q=85',
    banner: 'https://images.pexels.com/photos/89724/pexels-photo-89724.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Bestseller'], badge: 'Bestseller',
    description: 'From React fundamentals to shipping full-stack apps with Next.js 15 — Server Components, Actions, Streaming, Auth, Payments, and deployment.',
    whatYouLearn: ['React 19 & Server Components','Next.js 15 App Router mastery','Server Actions & data mutations','Auth with NextAuth v5','Stripe payments integration','Deploy on Vercel with edge functions'],
    skills: ['React','Next.js','TypeScript','Server Components','Tailwind','Auth.js','Stripe'],
    instructor: { name: 'Sarah Chen', title: 'Senior Engineer · Ex-Vercel', avatar: 'https://i.pravatar.cc/150?img=44', rating: 4.8, students: 52000, courses: 12, bio: 'Building on React since 2015. Contributor to Next.js documentation.' },
    curriculum: mkCurriculum([
      { title: 'React 19 Fundamentals', lessons: [['Course Setup','8:20'],['Components & Props','24:12'],['Hooks Deep Dive','38:20']] },
      { title: 'Next.js 15 App Router', lessons: [['App Router Basics','22:10'],['Server vs Client Components','32:40'],['Data Fetching Patterns','28:30']] },
      { title: 'Server Actions & Forms', lessons: [['Actions Fundamentals','28:20'],['Optimistic Updates','24:18'],['Validation with Zod','22:40']] },
      { title: 'Auth & Payments', lessons: [['NextAuth Setup','32:20'],['Stripe Integration','48:22'],['Webhooks','26:18']] },
      { title: 'Deployment & Performance', lessons: [['Vercel Deploy','18:20'],['Edge Functions','24:40'],['Analytics','20:15']] },
    ])
  },
  {
    slug: 'devops-kubernetes-mastery',
    title: 'DevOps & Kubernetes — Zero to Production',
    subtitle: 'CI/CD, Docker, K8s, Terraform, GitOps with real pipelines',
    category: 'devops', categoryName: 'DevOps',
    level: 'Intermediate', language: 'English',
    duration: '46h', lectures: 108, students: 15600, rating: 4.8, reviews: 2840,
    price: 119, originalPrice: 259, discount: 54,
    thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    banner: 'https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxkZXZlbG9wZXIlMjBjb2Rpbmd8ZW58MHx8fGJsdWV8MTc4NTA0NTcxMnww&ixlib=rb-4.1.0&q=85',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Live Batches','Popular'], badge: 'Popular',
    description: 'Complete DevOps roadmap — Docker, Kubernetes, Terraform, ArgoCD, GitHub Actions, and observability with Prometheus + Grafana.',
    whatYouLearn: ['Containerize any app with Docker best practices','Deploy production K8s clusters (EKS/GKE/AKS)','Automate infra with Terraform modules','Build GitOps pipelines with ArgoCD','Setup Prometheus + Grafana observability','Master GitHub Actions & GitLab CI'],
    skills: ['Docker','Kubernetes','Terraform','ArgoCD','Prometheus','GitHub Actions','Helm'],
    instructor: { name: 'Marcus Weber', title: 'Platform Engineer · CKA/CKS', avatar: 'https://i.pravatar.cc/150?img=52', rating: 4.8, students: 38000, courses: 9, bio: 'Building platforms for 12 years. Ex-Google SRE.' },
    curriculum: mkCurriculum([
      { title: 'Docker Mastery', lessons: [['Docker Fundamentals','24:20'],['Multi-Stage Builds','28:15'],['Docker Compose','22:30']] },
      { title: 'Kubernetes Deep Dive', lessons: [['Cluster Architecture','32:12'],['Pods, Services, Ingress','48:20'],['Helm Charts','34:15']] },
      { title: 'Infrastructure as Code', lessons: [['Terraform Basics','28:22'],['Modules & State','32:40'],['AWS + Terraform','44:18']] },
      { title: 'CI/CD & GitOps', lessons: [['GitHub Actions','28:20'],['ArgoCD Setup','32:22'],['Progressive Delivery','26:18']] },
    ])
  },
  {
    slug: 'python-data-science-pro',
    title: 'Python for Data Science & ML — Complete Bootcamp',
    subtitle: 'NumPy, Pandas, Scikit-learn, PyTorch with 15 real projects',
    category: 'python', categoryName: 'Python',
    level: 'Beginner', language: 'English',
    duration: '58h', lectures: 142, students: 32400, rating: 4.7, reviews: 6820,
    price: 79, originalPrice: 189, discount: 58,
    thumbnail: 'https://images.pexels.com/photos/1181394/pexels-photo-1181394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    banner: 'https://images.pexels.com/photos/7689766/pexels-photo-7689766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    promoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Bestseller','Beginner Friendly'], badge: 'Bestseller',
    description: 'The most complete Python + Data Science bootcamp. Zero to hire-ready with real projects: sales forecasting, image classification, NLP, and more.',
    whatYouLearn: ['Python from zero','Data wrangling with Pandas','Visualization: Matplotlib, Seaborn, Plotly','Classical ML with Scikit-learn','Deep Learning with PyTorch','Deploy models with FastAPI'],
    skills: ['Python','Pandas','NumPy','Scikit-learn','PyTorch','SQL','FastAPI'],
    instructor: { name: 'Dr. Elena Rodriguez', title: 'Lead Data Scientist · Ex-Meta', avatar: 'https://i.pravatar.cc/150?img=45', rating: 4.9, students: 84000, courses: 11, bio: 'PhD in Statistics. 10 years in industry ML.' },
    curriculum: mkCurriculum([
      { title: 'Python Fundamentals', lessons: [['Setup & IDE','12:20'],['Data Types & Control Flow','32:15'],['Functions & OOP','42:20']] },
      { title: 'Data Wrangling', lessons: [['NumPy Deep Dive','38:20'],['Pandas Essentials','48:40'],['Data Cleaning','32:15']] },
      { title: 'Machine Learning', lessons: [['Linear Regression','34:22'],['Classification','38:20'],['Trees & Ensembles','44:18']] },
      { title: 'Deep Learning', lessons: [['PyTorch Basics','38:20'],['CNNs for Vision','48:22'],['Transformers Intro','42:18']] },
    ])
  },
]

export const TESTIMONIALS = [
  { name: 'Arjun Patel', role: 'SAP Consultant → Integration Architect at Deloitte', avatar: 'https://i.pravatar.cc/150?img=68', text: 'The SAP CPI course transformed my career. Went from junior to architect in 14 months. The real-world scenarios and hands-on labs were game-changing.', rating: 5, course: 'SAP CPI Mastery' },
  { name: 'Neha Krishnan', role: 'Data Scientist at Microsoft', avatar: 'https://i.pravatar.cc/150?img=48', text: 'Best investment I made. The GenAI course helped me lead the LLM initiative at my company. Dr. Menon explains complex ideas so intuitively.', rating: 5, course: 'GenAI & LLM Engineering' },
  { name: 'Michael Chen', role: 'Solutions Architect at AWS', avatar: 'https://i.pravatar.cc/150?img=53', text: 'Passed my AWS SA Pro on the first try after this course. The mock exams and diagrams are the best on the internet.', rating: 5, course: 'AWS SA Pro' },
  { name: 'Sarah Johnson', role: 'DevOps Lead at Spotify', avatar: 'https://i.pravatar.cc/150?img=49', text: 'From "what is a container?" to leading platform engineering. This course is that transformational. 10/10.', rating: 5, course: 'DevOps & Kubernetes' },
  { name: 'Rahul Verma', role: 'Full-Stack Engineer at Stripe', avatar: 'https://i.pravatar.cc/150?img=60', text: 'The Next.js course felt like pair programming with a senior engineer. Every project shipped to production.', rating: 5, course: 'React & Next.js 15' },
  { name: 'Ana Silva', role: 'ML Engineer at Google', avatar: 'https://i.pravatar.cc/150?img=32', text: 'The Python bootcamp is genuinely the best on the internet. I recommend it to every junior on my team.', rating: 5, course: 'Python Data Science' },
]

export const LIVE_BATCHES = [
  { id: 'lb1', course: 'SAP CPI Integration Suite', startDate: '2025-07-15', time: '7:00 PM IST', instructor: 'Rajesh Kumar', slug: 'sap-cpi-integration-mastery', duration: '12 weekends', seats: 8 },
  { id: 'lb2', course: 'GenAI & LLM Engineering', startDate: '2025-07-22', time: '8:00 PM IST', instructor: 'Dr. Aditya Menon', slug: 'genai-llm-engineering', duration: '10 weekends', seats: 12 },
  { id: 'lb3', course: 'AWS Solutions Architect Pro', startDate: '2025-08-05', time: '9:00 AM IST', instructor: 'Priya Sharma', slug: 'aws-solutions-architect-pro', duration: '14 weekends', seats: 5 },
  { id: 'lb4', course: 'DevOps & Kubernetes', startDate: '2025-08-12', time: '7:30 PM IST', instructor: 'Marcus Weber', slug: 'devops-kubernetes-mastery', duration: '12 weekends', seats: 15 },
]

export const FAQS = [
  { q: 'How long do I have access to the course?', a: 'Lifetime access. Once you enroll, the content, updates, and community are yours forever.' },
  { q: 'Are the certificates industry-recognized?', a: 'Yes. Our certificates include a unique verification ID, QR code, and are LinkedIn-shareable. Endorsed by 200+ hiring partners.' },
  { q: 'Do I need any prior experience?', a: 'Depends on the course — each listing shows the required level. We have offerings from complete beginner to advanced/architect level.' },
  { q: 'What if I am not satisfied?', a: '30-day no-questions-asked money-back guarantee. If it is not right for you, we refund 100%.' },
  { q: 'Do you offer corporate training?', a: 'Absolutely. We have trained teams at Deloitte, Accenture, TCS, Infosys and more. Reach out via the Corporate section.' },
  { q: 'Are live classes recorded?', a: 'Yes, every live session is recorded and available in your dashboard within 2 hours.' },
]

export function getCourseBySlug(slug) { return COURSES.find(c => c.slug === slug) }
export function getCoursesByCategory(cat) { return COURSES.filter(c => c.category === cat) }
