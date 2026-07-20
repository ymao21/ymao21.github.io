/**
 * Central project data — one object per book on the shelf.
 * Adding an object here automatically creates the spine, cover,
 * hover preview and open-book detail view.
 *
 * @typedef {Object} Project
 * @property {string} slug
 * @property {string} title
 * @property {string} spineTitle
 * @property {string} subtitle
 * @property {string} description
 * @property {string[]} stack
 * @property {boolean} featured
 * @property {string} [badge]
 * @property {string} github
 * @property {string} [liveDemo]
 * @property {{label:string,url:string}[]} [articleLinks]
 * @property {string} coverColor
 * @property {string} accentColor
 * @property {{width:number,height:number,depth:number}} dimensions
 */

/** @type {Project[]} */
export const projects = [
  {
    slug: "clinical-kg-multi-agent",
    title: "Clinical Knowledge Graph Multi-Agent",
    spineTitle: "CLINICAL KNOWLEDGE GRAPH",
    subtitle: "Multi-Agent Clinical Information Extraction",
    description:
      "An ontology-guided multi-agent system for extracting structured clinical entities and relationships from medical transcripts.",
    stack: ["Python", "LLM Agents", "Knowledge Graphs", "Ontologies", "Clinical NLP"],
    featured: true,
    badge: "2026 AI + Science Hackathon Winner",
    github: "https://github.com/ymao21/clinical-kg-multi-agent",
    articleLinks: [
      {
        label: "Tools & technologies I've used in MS-ADS",
        url: "https://datascience.uchicago.edu/news/the-tools-languages-and-technologies-ive-actually-used-in-ms-ads/"
      },
      {
        label: "2026 AI + Science Hackathon recap",
        url: "https://datascience.uchicago.edu/news/2026-ai-science-hackathon-tackles-real-world-scientific-challenges-using-ai/"
      }
    ],
    coverColor: "#8C4A52",
    accentColor: "#F2D8C9",
    dimensions: { width: 66, height: 300, depth: 40 }
  },
  {
    slug: "dog-vision",
    title: "Dog Vision",
    spineTitle: "DOG VISION",
    subtitle: "Classifying and Reimagining Dogs with Deep Learning",
    description:
      "An end-to-end computer vision project combining dog classification, segmentation-guided editing, and image generation workflows.",
    stack: ["Deep Learning", "Computer Vision", "Classification", "Segmentation", "Diffusion"],
    featured: true,
    github: "https://github.com/ymao21/dog-vision-deep-learning",
    coverColor: "#C98A93",
    accentColor: "#4A3F4E",
    dimensions: { width: 52, height: 292, depth: 38 }
  },
  {
    slug: "speech-emotion-recognition",
    title: "Speech Emotion Recognition",
    spineTitle: "SPEECH EMOTION",
    subtitle: "Understanding Emotion from Audio",
    description:
      "A speech emotion recognition project that predicts emotional classes from audio and compares machine-learning and deep-learning approaches.",
    stack: ["Python", "Audio Processing", "RAVDESS", "CNN", "BiLSTM", "Machine Learning"],
    featured: true,
    github: "https://github.com/ymao21/Speech-Emotion-Recognition-",
    coverColor: "#3D405B",
    accentColor: "#EED7CE",
    dimensions: { width: 52, height: 296, depth: 37 }
  },
  {
    slug: "ai-industry-analysis",
    title: "AI Industry Analysis",
    spineTitle: "AI INDUSTRY ANALYSIS",
    subtitle: "NLP and Transformer Analysis of AI News",
    description:
      "An NLP project using topic modeling, named-entity recognition, and transformer-based sentiment analysis to study AI industry news.",
    stack: ["NLP", "BERTopic", "LDA", "NER", "Transformers", "Sentiment Analysis"],
    featured: true,
    github: "https://github.com/ymao21/AI-Industry-Analysis-using-NLP-Transformer-Models",
    coverColor: "#6D4C6F",
    accentColor: "#F0DFD3",
    dimensions: { width: 60, height: 290, depth: 39 }
  },
  {
    slug: "snowshop",
    title: "SNOWSHOP",
    spineTitle: "SNOWSHOP",
    subtitle: "A Marketplace for Winter Sports",
    description:
      "A full-stack social e-commerce marketplace for buying and selling snowboards, skis, gear, and accessories.",
    stack: ["React", "Redux", "Express", "PostgreSQL", "AWS"],
    featured: true,
    github: "https://github.com/ymao21/SNOWSHOP",
    coverColor: "#7F9BAF",
    accentColor: "#2F3546",
    dimensions: { width: 56, height: 288, depth: 40 }
  },
  {
    slug: "sar-coach",
    title: "SAR Coach",
    spineTitle: "SAR COACH",
    subtitle: "Voice-to-Voice Behavioral Interview Agent",
    description:
      "An adaptive voice-first interview coach that evaluates Situation, Action, and Result, identifies the weakest section, asks a targeted follow-up, and speaks an improved response.",
    stack: ["Python", "LangGraph", "Gradio", "Speech Recognition", "LLMs", "Text-to-Speech"],
    featured: false,
    github: "https://github.com/ymao21/SAR-Coach",
    coverColor: "#E0A17E",
    accentColor: "#4A3F4E",
    dimensions: { width: 42, height: 266, depth: 32 }
  },
  {
    slug: "research-paper-rag",
    title: "Research Paper RAG",
    spineTitle: "RESEARCH PAPER RAG",
    subtitle: "Question Answering over AI Research Papers",
    description:
      "An end-to-end retrieval-augmented generation system for asking questions across a collection of AI and machine-learning research papers.",
    stack: ["RAG", "Vector Database", "Embeddings", "RAGAS", "Python"],
    featured: false,
    github: "https://github.com/ymao21/end-to-end-RAG-system-for-AI-research-papers",
    coverColor: "#9CAF97",
    accentColor: "#3E4A3C",
    dimensions: { width: 58, height: 274, depth: 33 }
  },
  {
    slug: "verizon-default-risk",
    title: "Verizon Default Risk",
    spineTitle: "VERIZON DEFAULT RISK",
    subtitle: "Balancing Credit Risk and Customer Growth",
    description:
      "A device-financing risk modeling project comparing classification approaches and approval strategies.",
    stack: ["Python", "Logistic Regression", "Classification", "Risk Modeling", "Business Analytics"],
    featured: false,
    github: "https://github.com/ymao21/Verizon-default-risk-modeling-project",
    coverColor: "#5C5470",
    accentColor: "#EBDCCB",
    dimensions: { width: 60, height: 262, depth: 30 }
  },
  {
    slug: "amazon-review-similarity",
    title: "Amazon Review Similarity",
    spineTitle: "AMAZON REVIEWS",
    subtitle: "Big Data Similarity Analysis",
    description:
      "A distributed data workflow for processing large-scale Amazon review and product data for cleaning, joining, aggregation, and similarity analysis.",
    stack: ["PySpark", "Google Cloud", "Parquet", "Big Data", "Similarity Analysis"],
    featured: false,
    github: "https://github.com/ymao21/amazon-reviews-ai-similarity",
    coverColor: "#B98263",
    accentColor: "#F4E7D8",
    dimensions: { width: 50, height: 270, depth: 34 }
  },
  {
    slug: "spotify-song-recommender",
    title: "Spotify Song Recommender",
    spineTitle: "SONG CLUSTERING",
    subtitle: "Clustering Music Beyond Genre",
    description:
      "An unsupervised-learning project that groups songs through audio and lyrical characteristics for content-based recommendations.",
    stack: ["Python", "K-Means", "TF-IDF", "UMAP", "NLP", "Recommendation Systems"],
    featured: false,
    github: "https://github.com/ymao21/spotify-song-clustering-recommender",
    coverColor: "#A99BC6",
    accentColor: "#3E3650",
    dimensions: { width: 52, height: 258, depth: 31 }
  },
  {
    slug: "influenza-forecasting",
    title: "Seasonal Influenza Forecasting",
    spineTitle: "FLU FORECASTING",
    subtitle: "Statistical Forecasting of Flu Dynamics",
    description:
      "A time-series forecasting project using influenza surveillance data and seasonal statistical models.",
    stack: ["Time Series", "SARIMA", "Forecasting", "Statistics", "CDC Data"],
    featured: false,
    github: "https://github.com/ymao21/seasonal-influenza-forecasting-models",
    coverColor: "#6FA8A0",
    accentColor: "#2E4744",
    dimensions: { width: 52, height: 268, depth: 32 }
  },
  {
    slug: "ecommerce-segmentation",
    title: "E-Commerce Customer Segmentation",
    spineTitle: "CUSTOMER SEGMENTS",
    subtitle: "Personalized Promotions through Customer Clusters",
    description:
      "A customer-segmentation project using behavioral and purchase data to create actionable customer groups.",
    stack: ["Python", "K-Means", "RFM", "Customer Analytics", "Business Strategy"],
    featured: false,
    github: "https://github.com/ymao21/ecommerce-customer-segmentation",
    coverColor: "#D9A79C",
    accentColor: "#503C3F",
    dimensions: { width: 56, height: 264, depth: 33 }
  },
  {
    slug: "speech-to-speech-assistant",
    title: "Offline Speech-to-Speech Assistant",
    spineTitle: "SPEECH TO SPEECH",
    subtitle: "A Local Voice-Based LLM Pipeline",
    description:
      "A speech-to-speech assistant that transcribes a spoken question, reasons with a local language model, and generates a spoken response.",
    stack: ["Whisper", "TinyLlama", "SpeechT5", "Audio Processing", "Google Colab"],
    featured: false,
    github: "https://github.com/ymao21/simple-speech-to-speech-llm-assistant",
    coverColor: "#C7B9A2",
    accentColor: "#4E4536",
    dimensions: { width: 54, height: 272, depth: 31 }
  }
];
