/**
 * Project content for the bookshelf.
 *
 * Array order is shelf order, left to right. Featured titles sit in the
 * middle of the shelf and are rendered taller, so keep them grouped there.
 * Every field below is rendered somewhere: the spine, the hover preview,
 * or the detail dialog. Nothing here is decorative.
 *
 * @typedef {Object} Project
 * @property {string} slug
 * @property {string} title
 * @property {string} spineTitle   - uppercase, short enough to fit a spine
 * @property {string} type         - short category line, e.g. "Agentic AI · Clinical NLP"
 * @property {string} subtitle     - one-line positioning statement
 * @property {string} problem      - the situation before the work existed
 * @property {string} built        - what was actually designed and shipped
 * @property {string} result       - measured outcome, or the honest finding
 * @property {string} year         - when the work was done
 * @property {string[]} stack
 * @property {boolean} featured    - the small set surfaced first; keep to five
 * @property {string} [badge]      - award or recognition
 * @property {string} [team]       - collaboration note, when not solo
 * @property {string} [myRole]     - what I personally owned on a team project
 * @property {string} github
 * @property {{label:string,url:string}[]} [links] - extra external links
 * @property {{src:string,alt:string,caption:string}[]} [visuals]
 *   - figures from the project's own repo or deck, first one leads the
 *     preview; omit when none exists
 * @property {string} cover        - spine / cover color
 * @property {string} foil         - text color used on that cover
 * @property {{width:number,height:number}} dimensions
 */

/** @type {Project[]} */
export const projects = [
  {
    slug: "speech-emotion-recognition",
    title: "Speech Emotion Recognition",
    spineTitle: "SPEECH EMOTION",
    type: "Audio ML · Classification",
    subtitle: "Predicting emotion from raw speech audio",
    problem:
      "Voice assistants and support systems hear the words but miss the emotion carrying them, which is often the part that decides how a conversation should be handled.",
    built:
      "An 8-class emotion classifier over 1,440 RAVDESS clips. Each recording is reduced to a 40-dimensional time-averaged MFCC vector, then logistic regression, a 300-tree random forest and a batch-normalized MLP are compared on a stratified split with macro F1 reported alongside accuracy.",
    result:
      "The random forest baseline reached 58.7% accuracy and 0.547 macro F1, about 16 points above logistic regression. The write-up is explicit about the two things capping it: random splits allow the same actor into train and test, and time-averaged MFCCs discard the temporal dynamics emotion actually lives in.",
    year: "Mar–May 2026",
    ended: "2026-05",
    stack: ["Python", "librosa", "scikit-learn", "MFCC", "Random Forest", "Keras"],
    featured: false,
    team: "4-person team, UChicago ML II",
    myRole:
      "Owned data cleaning and preprocessing, MFCC feature extraction, and the baseline modeling. Compared logistic regression against random forest, selected random forest as the stronger baseline, built the first deep-learning model, and left the team a reusable preprocessing and modeling pipeline.",
    visuals: [
      {
        src: "img/projects/speech-emotion-recognition-1.jpg",
        alt: "Waveforms, mel spectrograms and MFCCs for sample clips across emotions",
        caption: "Waveforms, mel spectrograms and MFCCs by emotion"
      },
      {
        src: "img/projects/speech-emotion-recognition-2.jpg",
        alt: "Random forest baseline slide with its confusion matrix, 0.587 test accuracy and 0.547 macro F1",
        caption: "The random forest baseline and its confusion matrix"
      }
    ],
    github: "https://github.com/ymao21/Speech-Emotion-Recognition-",
    cover: "#B9C3DE",
    foil: "#2A2F44",
    dimensions: { width: 52, height: 248 }
  },
  {
    slug: "influenza-forecasting",
    title: "Seasonal Influenza Forecasting",
    spineTitle: "FLU FORECASTING",
    type: "Time Series · Public Health",
    subtitle: "Forecasting flu activity through a structural break",
    problem:
      "Health systems need to know when influenza will peak and how high it will go. The surveillance data makes that hard: strong annual seasonality, a heavily right-skewed distribution, and an 18-month stretch where COVID suppressed flu almost entirely.",
    built:
      "A classical forecasting workflow over 468 weeks of CDC FluView data (2015 to 2024): Box-Cox variance stabilization at lambda 0.3617, ADF and KPSS stationarity testing, seasonal differencing at lag 52, and SARIMA(2,0,2)(1,1,1)[52] selected on AICc with Ljung-Box residual checks. ARIMAX variants carry ILINet, ESSENCE and ICU admission covariates.",
    result:
      "Adding a COVID structural-break indicator cut RMSE from 4.456 to 2.587, roughly 42%. On the 2023 to 2024 hold-out season the SARIMA model forecast peaks with about 49% lower RMSE than the next-best baseline, while staying interpretable enough to explain to a planning team.",
    year: "Jan–Mar 2026",
    ended: "2026-03",
    stack: ["R", "SARIMA", "ARIMAX", "TBATS", "Box-Cox", "RMarkdown"],
    featured: false,
    github: "https://github.com/ymao21/seasonal-influenza-forecasting-models",
    cover: "#D3D8E8",
    foil: "#2E3347",
    dimensions: { width: 50, height: 242 }
  },
  {
    slug: "spotify-song-recommender",
    title: "Song Clustering & Recommendation",
    spineTitle: "SONG CLUSTERING",
    type: "Unsupervised Learning · Recommendations",
    subtitle: "Grouping music by sound and lyrics instead of genre",
    problem:
      "Genre labels are subjective, noisy, and missing exactly where recommendations need them most: new and niche tracks. Anything built on them inherits a cold-start problem.",
    built:
      "An unsupervised pipeline across 955,320 tracks that combines Spotify audio features with TF-IDF lyric vectors reduced by Truncated SVD, standardized and L2-normalized into a single feature space. K-Means, MiniBatchKMeans, DBSCAN and hierarchical clustering were compared, and recommendations are served as cosine nearest neighbors constrained within a cluster.",
    result:
      "Eight clusters with readable profiles: speech-heavy, acoustic and low-energy, upbeat dance, dark high-energy instrumental. MiniBatchKMeans was chosen for full-corpus scale and out-of-sample assignment, and a logistic-regression benchmark on the labeled subset reached 59.1% accuracy with 85.3% top-3 accuracy.",
    year: "Jan–Mar 2026",
    ended: "2026-03",
    stack: ["Python", "scikit-learn", "MiniBatchKMeans", "TF-IDF", "Truncated SVD", "UMAP"],
    featured: false,
    visuals: [
      {
        src: "img/projects/spotify-song-recommender-1.jpg",
        alt: "Table of the eight clusters with nickname, audio profile and top lyric terms",
        caption: "Cluster profiles: what each group sounds like"
      },
      {
        src: "img/projects/spotify-song-recommender-2.jpg",
        alt: "Elbow, silhouette and cluster-balance plots used to choose k = 8",
        caption: "Choosing the number of clusters"
      },
      {
        src: "img/projects/spotify-song-recommender-3.jpg",
        alt: "Recommendation demo table: nearest-neighbour tracks within one cluster with cosine distances",
        caption: "Content-based nearest-neighbour recommendations"
      }
    ],
    github: "https://github.com/ymao21/spotify-song-clustering-recommender",
    cover: "#9FAFC4",
    foil: "#1E2632",
    dimensions: { width: 50, height: 246 }
  },

  /* ---------- featured: centre of the shelf ---------- */
  {
    slug: "ecommerce-segmentation",
    title: "E-Commerce Customer Segmentation",
    spineTitle: "CUSTOMER SEGMENTS",
    type: "Customer Analytics · Stakeholder Deliverables",
    subtitle: "One segmentation, two audiences: a CTO deck and a CMO business case",
    problem:
      "An e-commerce site showed identical checkout promotions to every customer and asked, loosely, for something better. The brief had to be turned into a segmentation strategy that a technical lead could validate and a marketing lead could fund.",
    built:
      "K-Means segmentation over RFM features joined with survey responses and category-level purchase history, validated with an elbow plot and PCA projection. A rules-based reassignment layer moves customers between segments as new transactions arrive, so every shopper carries exactly one segment, including new visitors with no history at all.",
    result:
      "Six named, business-readable segments with a projected 20% incremental sales lift on the top 15% high-engagement group. I recommended a phased rollout starting with that segment for a cleaner path to measurable ROI, and delivered the work twice: a technical deck for the CTO and a business case for the CMO and webmaster.",
    year: "Mar–Jun 2026",
    ended: "2026-06",
    stack: ["Python", "scikit-learn", "K-Means", "RFM", "PCA", "Plotly"],
    featured: false,
    visuals: [
      {
        src: "img/projects/ecommerce-segmentation-1.jpg",
        alt: "Segment profile table and radar chart comparing recency, frequency, monetary value and category diversity",
        caption: "Segment profiles from the stakeholder deck"
      },
      {
        src: "img/projects/ecommerce-segmentation-2.jpg",
        alt: "Swimlane diagram of real-time customer segmentation and incentive delivery",
        caption: "Real-time segmentation and incentive delivery flow"
      },
      {
        src: "img/projects/ecommerce-segmentation-3.jpg",
        alt: "Slide on the high-engagement segment and the expected impact of personalization",
        caption: "The high-engagement segment and expected lift"
      }
    ],
    github: "https://github.com/ymao21/ecommerce-customer-segmentation",
    cover: "#E3E1DA",
    foil: "#3A3B44",
    dimensions: { width: 54, height: 250 }
  },
  {
    slug: "ai-industry-analysis",
    title: "AI Industry Analysis",
    spineTitle: "AI INDUSTRY ANALYSIS",
    type: "NLP · Transformers at Scale",
    subtitle: "Structured insight from 196K AI news articles",
    problem:
      "Around 200,000 AI news articles is too much to read and too noisy to summarize by hand. The question worth answering is what the industry is actually saying, about which companies, and in what direction.",
    built:
      "A three-stage NLP pipeline over roughly 196,000 cleaned documents. BERTopic with sentence embeddings, UMAP and HDBSCAN handles semantic topic discovery, benchmarked against an LDA baseline. spaCy NER with frequency thresholding extracts organizations and technologies. A DistilBERT classifier fine-tuned on the Financial PhraseBank all-agree subset scores sentiment.",
    result:
      "The sentiment classifier reached 96% accuracy and 0.95 macro F1 on the Financial PhraseBank held-out set. It was then applied out of domain to the full ~196K AI-news corpus, so those figures describe the benchmark rather than the news data, and the write-up flags that domain gap. BERTopic produced cleaner, more distinct clusters than the LDA baseline on long-form text.",
    year: "Jan–Apr 2026",
    ended: "2026-04",
    stack: ["Python", "BERTopic", "DistilBERT", "spaCy", "UMAP", "HDBSCAN", "PyTorch", "Hugging Face"],
    featured: true,
    visuals: [
      {
        src: "img/projects/ai-industry-analysis-1.jpg",
        alt: "Treemap of the industries most likely to be impacted by AI, sized by news coverage and colored by sentiment",
        caption: "Industries most likely to be impacted"
      },
      {
        src: "img/projects/ai-industry-analysis-2.jpg",
        alt: "Bubble chart of industry AI impact exposure by mean sentiment and share of positive articles",
        caption: "Topic-level sentiment and exposure by industry"
      },
      {
        src: "img/projects/ai-industry-analysis-3.jpg",
        alt: "Line chart of rolling three-month sentiment by industry, 2022 to 2026",
        caption: "Topic-level sentiment over time"
      }
    ],
    github: "https://github.com/ymao21/AI-Industry-Analysis-using-NLP-Transformer-Models",
    cover: "#B0BBDA",
    foil: "#242A47",
    dimensions: { width: 58, height: 268 }
  },
  {
    slug: "sar-coach",
    title: "SAR Coach",
    spineTitle: "SAR COACH",
    type: "Agentic AI · Voice Interfaces",
    subtitle: "A voice-to-voice behavioral interview agent",
    problem:
      "Interview practice is either a static list of questions or a chatbot you type into. Neither gives you the thing that actually matters, which is spoken feedback on a spoken answer, delivered under time pressure.",
    built:
      "Two LangGraph state machines sequence the full loop: local Whisper transcription, strict Situation / Action / Result scoring, deterministic weakest-section detection, one adaptive spoken follow-up targeting that section, and an improved answer read back in a selectable interviewer accent. Pydantic validates every model response, and any node can short-circuit to the end so a failure never calls the next paid service.",
    result:
      "Two reasoning calls per interview, with speech-to-text running on-device so no audio leaves the machine and there is no per-minute transcription bill. Scoring, weakest-section selection and validation are plain Python; the model is called only where genuine reasoning is required.",
    year: "Jun–Jul 2026",
    ended: "2026-07",
    stack: ["Python", "LangGraph", "OpenAI", "mlx-whisper", "Pydantic", "Gradio", "Text-to-Speech"],
    featured: false,
    visuals: [
      {
        src: "img/projects/sar-coach-1.jpg",
        alt: "SAR Coach interface: choosing a behavioral question and interviewer voice",
        caption: "The SAR Coach interface"
      },
      {
        src: "img/projects/sar-coach-2.jpg",
        alt: "SAR Coach detailed evaluation view with Situation, Action and Result scores",
        caption: "Detailed SAR evaluation"
      }
    ],
    github: "https://github.com/ymao21/SAR-Coach",
    cover: "#CBD2DC",
    foil: "#2A3040",
    dimensions: { width: 56, height: 264 }
  },

  /* ---------- featured: surfaced first ---------- */
  {
    slug: "verizon-default-risk",
    title: "Device Financing Credit Risk",
    spineTitle: "CREDIT RISK MODELING",
    type: "Risk Modeling · Business Decisioning",
    subtitle: "Turning a default model into an approval threshold",
    problem:
      "Device financing is a growth-versus-loss tradeoff. Approve more applicants and revenue rises along with defaults; approve too few and the sale is lost. The decision needed a threshold, not just a model.",
    built:
      "A credit-approval analysis over roughly 12,000 device-financing applications from 2020 to 2025, with 90-plus day delinquency defined as the default outcome. Logistic regression, random forest and XGBoost were compared under class weighting, then the approval cutoff was calibrated on the precision-recall curve rather than left at the default 0.5.",
    result:
      "Logistic regression won on the balance of ROC-AUC, recall and interpretability, which matters when a declined applicant needs an explanation. The recommended threshold projected about $25.75 in incremental cash flow per applicant, roughly $25.7M per million applicants, with FICO the strongest protective predictor.",
    year: "Sep–Dec 2025",
    ended: "2025-12",
    stack: ["Python", "scikit-learn", "Logistic Regression", "XGBoost", "Threshold Tuning", "Business Analytics"],
    featured: true,
    visuals: [
      {
        src: "img/projects/verizon-default-risk-1.jpg",
        alt: "Business impact table and chart showing net cash flow per applicant under the current and recommended model",
        caption: "Business impact of the recommended threshold"
      },
      {
        src: "img/projects/verizon-default-risk-2.jpg",
        alt: "Model comparison table and precision-recall curve for logistic regression",
        caption: "Why logistic regression won the comparison"
      },
      {
        src: "img/projects/verizon-default-risk-3.jpg",
        alt: "Feature importance chart and coefficient table for the predictors of default",
        caption: "The hierarchy of predictors"
      }
    ],
    github: "https://github.com/ymao21/Verizon-default-risk-modeling-project",
    cover: "#C6CCE8",
    foil: "#2C3150",
    dimensions: { width: 64, height: 300 }
  },
  {
    slug: "research-paper-rag",
    title: "Research Paper RAG",
    spineTitle: "RESEARCH PAPER RAG",
    type: "RAG · Retrieval Evaluation",
    subtitle: "Treating retrieval choices as an experiment",
    problem:
      "Answering questions across 75 arXiv papers is easy to demo and hard to trust. The difficult part is not generation, it is proving which retrieval decisions actually improve the answer.",
    built:
      "An end-to-end RAG pipeline built as a grid: two chunking strategies, recursive and section-aware, crossed with three retrieval methods, cosine, BM25 plus dense via reciprocal rank fusion, and HyDE, crossed with four prompt variants. Documents are parsed with PyMuPDF and pdfplumber, embedded locally, indexed in ChromaDB, and evaluated with RAGAS plus a deterministic Hit@3 against ground-truth qrels.",
    result:
      "Section-aware chunking with cosine retrieval won at 0.96 faithfulness and 0.96 context precision, lifting answer correctness on table-heavy queries from 0.55 to 0.70. The evaluation also found the real ceiling: Hit@3 never exceeded 0.25, so retrieval rather than generation was capping the whole system.",
    year: "May 2026",
    ended: "2026-05",
    stack: ["Python", "ChromaDB", "RAGAS", "sentence-transformers", "BM25", "HyDE", "GPT-4o-mini", "PyMuPDF"],
    featured: true,
    github: "https://github.com/ymao21/end-to-end-RAG-system-for-AI-research-papers",
    cover: "#8E9BCF",
    foil: "#1C2140",
    dimensions: { width: 66, height: 306 }
  },
  {
    slug: "voice-product-discovery",
    title: "Voice Product Discovery",
    spineTitle: "VOICE PRODUCT DISCOVERY",
    type: "Agentic AI · MCP · RAG",
    subtitle: "A voice-to-voice shopping agent that refuses to guess",
    problem:
      "Shopping assistants built on a single prompt lose the thread. Ask for a comforter under fifty dollars, then say \"actually under forty\", and a prompt chain either forgets the first constraint or keeps the stale one. Worse, when nothing matches it invents a product, a price, or a citation.",
    built:
      "The team built a voice-and-text product discovery system: a React and Vite frontend over a FastAPI backend, with a LangGraph workflow that routes a request, checks safety, plans the search, retrieves and reranks candidates, reconciles them against live listings, and answers. Every search crosses a real MCP client/server boundary exposing two tools, rag.search over a private Chroma index of 2,615 Amazon-2020 products and web.search for live price and availability. Whisper transcribes spoken requests and text-to-speech reads the answer back. Constraints accumulate across turns, and an answer critic checks document IDs, the top pick and every stated price against retrieved evidence before anything is shown.",
    result:
      "Grounding is enforced in code rather than requested in a prompt. Recommendations carry catalog or live citations, the reconciliation step flags catalog-to-live price gaps above 15%, and requests that nothing in the catalog satisfies return an explicit no-match rather than an invented product.",
    year: "Jun–Aug 2026",
    ended: "2026-08",
    stack: ["Python", "LangGraph", "MCP", "FastAPI", "ChromaDB", "Whisper", "React", "RAG Evaluation"],
    featured: true,
    team: "4-person team",
    myRole:
      "I worked on the Amazon product-data ingestion and Chroma indexing, the LangGraph and MCP integration, retrieval reconciliation and no-match handling, the live-search fallback, and the reliability fixes before the demo.",
    visuals: [
      {
        src: "img/projects/voice-product-discovery-1.jpg",
        alt: "System architecture: React browser client, FastAPI gateway with Whisper, LangGraph and TTS, an MCP server exposing rag.search and web.search, a Chroma index and search providers",
        caption: "System architecture"
      },
      {
        src: "img/projects/voice-product-discovery-2.jpg",
        alt: "LangGraph routing diagram: router, safety and clarify branches, planner, rag.search, web.search fallback, reconcile and answer critic",
        caption: "LangGraph routes by safety, intent and evidence"
      },
      {
        src: "img/projects/voice-product-discovery-3.jpg",
        alt: "Evaluation summary: 17 of 19 targets met, with results for router F1, retrieval recall, answer faithfulness, answer relevance and latency",
        caption: "Evaluation results against targets"
      }
    ],
    github: "https://github.com/ymao21/voice-product-discovery",
    cover: "#A6B1E1",
    foil: "#23284A",
    dimensions: { width: 68, height: 310 }
  },
  {
    slug: "clinical-kg-multi-agent",
    title: "Clinical Knowledge Graph Agents",
    spineTitle: "CLINICAL KNOWLEDGE GRAPH",
    type: "Agentic AI · Clinical NLP",
    subtitle: "Multi-agent extraction from clinical transcripts",
    problem:
      "A 15-minute clinical visit produces a dense, unstructured transcript. Symptoms, history and treatments are scattered through the conversation, so the next clinician picking up that patient has to read all of it to rebuild the picture.",
    built:
      "An ontology-driven multi-agent system that turns raw transcripts into a validated, queryable knowledge graph. Language-model agents handle broad extraction and a targeted completeness pass for commonly missed node types, while deterministic rule-based agents enforce the node and edge taxonomy, resolve duplicate entities, and drop invalid edges before anything reaches the graph. Entity resolution across patients runs on BGE-M3 embeddings.",
    result:
      "Composite evaluation score against the human-curated reference graph rose from 0.562 with the naive single-pass baseline to 0.933 with the multi-agent system, with roughly 0.73 entity-level F1, on a constrained open-model budget. The system won the 2026 Schmidt AI in Science Hackathon at UChicago.",
    year: "Apr 2026",
    ended: "2026-04",
    stack: ["Python", "LLM Agents", "Knowledge Graphs", "GraphRAG", "Ontologies", "Clinical NLP", "OpenRouter"],
    featured: true,
    badge: "Schmidt AI in Science Hackathon — Winner",
    team: "Hackathon team project",
    myRole:
      "Contributed to prompt engineering, ontology design, evaluation, and workflow development for the multi-agent extraction system, and ran the composite-score evaluation against the human-curated reference graph.",
    github: "https://github.com/ymao21/clinical-kg-multi-agent",
    links: [
      {
        label: "UChicago DSI: hackathon recap",
        url: "https://datascience.uchicago.edu/news/2026-ai-science-hackathon-tackles-real-world-scientific-challenges-using-ai/"
      },
      {
        label: "My DSI article on the tools I use",
        url: "https://datascience.uchicago.edu/news/the-tools-languages-and-technologies-ive-actually-used-in-ms-ads/"
      }
    ],
    cover: "#7E8CBE",
    foil: "#171B33",
    dimensions: { width: 70, height: 316 }
  },
  {
    slug: "dog-vision",
    title: "Dog Vision",
    spineTitle: "DOG VISION",
    type: "Computer Vision · Generative AI",
    subtitle: "Classification, segmentation and diffusion in one pipeline",
    problem:
      "Pet imagery runs through adoption platforms, veterinary records, insurance workflows and retail tooling. Each one needs a different capability: recognize the animal, replace it convincingly, or repair what the photo is missing.",
    built:
      "Three connected capabilities. A ResNet-50 backbone with multiple heads predicts breed, AKC group, size, coat length and coat color in one forward pass. A pose-aware replacement pipeline chains YOLO detection, a fine-tuned 24-keypoint pose model, SAM2 segmentation, piecewise affine warping, StyleGAN2-ADA face alignment and diffusion inpainting. A third track compares U-Net, edge-guided CNN and Stable Diffusion inpainting on masked regions.",
    result:
      "86.1% held-out breed accuracy across 120 classes on 20,580 Stanford Dogs images, with 94.1% on breed group and 95.1% on coat length. Controlled ablations ranked the pipeline components rather than guessing: RealVisXL inpainting scored 0.988 cycle consistency against 0.738 for the segmentation-only variant.",
    year: "Mar–Jun 2026",
    ended: "2026-06",
    stack: ["PyTorch", "ResNet-50", "YOLO", "SAM2", "StyleGAN2-ADA", "Stable Diffusion", "LPIPS"],
    featured: false,
    team: "4-person team, UChicago Computer Vision",
    myRole:
      "Built and evaluated the dog-breed classification models and the training and evaluation pipeline, including the architecture comparison and performance analysis.",
    visuals: [
      {
        src: "img/projects/dog-vision-1.jpg",
        alt: "Diagram of the dog replacement pipeline: inputs, pose, segment, warp, diffuse, outputs",
        caption: "The full replacement pipeline"
      },
      {
        src: "img/projects/dog-vision-2.jpg",
        alt: "Segmentation comparison of YOLO-seg and SAM2 with an explanation of how SAM2 works",
        caption: "Segmentation with YOLO-seg and SAM2"
      },
      {
        src: "img/projects/dog-vision-3.jpg",
        alt: "Diffusion inpainting comparison across Stable Diffusion XL, RealVisXL and Realistic Vision",
        caption: "Comparing diffusion inpainting models"
      }
    ],
    github: "https://github.com/ymao21/dog-vision-deep-learning",
    cover: "#DCE0EC",
    foil: "#2B3050",
    dimensions: { width: 60, height: 260 }
  },

  /* ---------- remaining titles ---------- */
  {
    slug: "amazon-review-similarity",
    title: "Amazon Reviews at Scale",
    spineTitle: "AMAZON REVIEWS",
    type: "Data Engineering · Distributed Computing",
    subtitle: "65M reviews, cleaned and deduplicated in Spark",
    problem:
      "65 million customer reviews across 52.4 GiB of nested Parquet is well past the point where a local pandas workflow is an option.",
    built:
      "A PySpark pipeline on Dataproc reading review and product metadata directly from Google Cloud Storage: flatten the nested metadata, join on product identifier, filter invalid IDs, prices and text lengths, then persist the cleaned table back to Parquet so no later step ever reprocesses the raw source. Review text is then tokenized into n-grams, hashed, and matched with MinHash-LSH for near-duplicate detection.",
    result:
      "Found 476 near-duplicate review title pairs while full-text duplicates were nearly nonexistent, and showed that review volume clusters around 4.3 to 4.6 average ratings rather than at 5.0. Persisting the cleaned join turned an expensive rerun into a cheap read.",
    year: "Sep–Dec 2025",
    ended: "2025-12",
    stack: ["PySpark", "Spark MLlib", "Dataproc", "Google Cloud Storage", "Parquet", "MinHash-LSH"],
    featured: false,
    visuals: [
      {
        src: "img/projects/amazon-review-similarity-1.jpg",
        alt: "Scatter plots of average rating against review volume and price across Amazon products",
        caption: "What drives review volume"
      },
      {
        src: "img/projects/amazon-review-similarity-2.jpg",
        alt: "Bar charts of duplicated review titles versus duplicated review texts",
        caption: "Review title and text duplication"
      },
      {
        src: "img/projects/amazon-review-similarity-3.jpg",
        alt: "Most common words in 5-star versus 1-star reviews",
        caption: "What 5-star and 1-star reviews emphasize"
      }
    ],
    github: "https://github.com/ymao21/amazon-reviews-ai-similarity",
    cover: "#9FAFC4",
    foil: "#1E2632",
    dimensions: { width: 54, height: 254 }
  },
  {
    slug: "speech-to-speech-assistant",
    title: "Offline Speech-to-Speech Assistant",
    spineTitle: "SPEECH TO SPEECH",
    type: "Applied GenAI · Local Inference",
    subtitle: "A full voice loop with no API calls",
    problem:
      "Using a voice assistant normally means sending your audio to somebody else's API, which is a privacy problem in some settings and a cost problem in others.",
    built:
      "A complete voice loop running on a free Colab T4: Whisper-small transcribes the question, TinyLlama-1.1B generates the answer, and SpeechT5 with a HiFi-GAN vocoder synthesizes the reply, conditioned on a 512-dimensional x-vector speaker embedding. Running that same encoder on my own recording clones my voice into the output.",
    result:
      "About 102 seconds end to end, and the breakdown is the actual lesson: 92.3 seconds of it is text-to-speech. That is precisely why production assistants stream stages in parallel instead of running them in sequence. A single ASR word error visibly changed the model's answer, which makes the quality chain concrete.",
    year: "Jun–Aug 2026",
    ended: "2026-08",
    stack: ["Whisper", "TinyLlama", "SpeechT5", "HiFi-GAN", "SpeechBrain", "PyTorch"],
    featured: false,
    github: "https://github.com/ymao21/simple-speech-to-speech-llm-assistant",
    cover: "#D3D8E8",
    foil: "#2E3347",
    dimensions: { width: 48, height: 238 }
  },
  {
    slug: "snowshop",
    title: "SNOWSHOP",
    spineTitle: "SNOWSHOP",
    type: "Full-Stack Engineering",
    subtitle: "A social marketplace for winter sports gear",
    problem:
      "Winter sports gear is expensive enough to keep people out of the sport entirely, and secondhand boards and skis are scattered across listings that were never built for them.",
    built:
      "A full-stack marketplace for new and secondhand snowboards, skis and accessories. React and Redux on the front end, Express with PostgreSQL behind it, JWT and CSRF token authentication, and AWS S3 image storage so sellers can list gear without worrying about upload limits.",
    result:
      "Full CRUD across products, reviews and carts with product search, and a single reusable modal component driving every dialog in the application instead of one component per dialog.",
    year: "2023",
    ended: "2023-12",
    stack: ["React", "Redux", "Express", "PostgreSQL", "AWS S3", "JWT", "Node.js"],
    featured: false,
    visuals: [
      {
        src: "img/projects/snowshop-1.jpg",
        alt: "SNOWSHOP edit-product dialog for a listed snowboard",
        caption: "Editing a listing in SNOWSHOP"
      }
    ],
    github: "https://github.com/ymao21/SNOWSHOP",
    cover: "#B9C3DE",
    foil: "#2A2F44",
    dimensions: { width: 52, height: 244 }
  },
  {
    slug: "slacker",
    title: "Slacker",
    spineTitle: "SLACKER",
    type: "Full-Stack Engineering",
    subtitle: "A real-time Slack-style messaging application",
    problem:
      "Group messaging looks simple until you build it. Messages have to reach every member of a channel without a refresh, survive edits and deletes, and stay searchable once there are enough of them to scroll past.",
    built:
      "A full-stack messaging app modeled on Slack. React and Redux on the front end, Flask and PostgreSQL behind it, with Socket.io carrying live chat so messages appear across every member and channel without a page refresh. Users create, edit, delete and leave channels, start direct or group messages, send rich text with bold, italics, underline, lists and emoji, edit or delete a sent message (which greys out and reads as deleted, with a timestamp), set a status with a note, and search users and messages from the nav bar with results filtered from the backend as they type.",
    result:
      "A working deployment on Render with live WebSocket chat, dynamic message loading, a channel browser, direct and group messaging, user and message search, and status updates. Built before I moved into data science, and the reason the later projects had a full-stack foundation to sit on.",
    stack: ["React", "Redux", "JavaScript", "Python", "Flask", "PostgreSQL", "Socket.io", "Render"],
    featured: false,
    year: "2023",
    ended: "2023-10",
    visuals: [
      {
        src: "img/projects/slacker-1.jpg",
        alt: "Slacker landing page with a Launch Demo Server button",
        caption: "The Slacker landing page"
      }
    ],
    github: "https://github.com/ymao21/Slacker",
    cover: "#9FAFC4",
    foil: "#1E2632",
    dimensions: { width: 50, height: 240 }
  }
];

/** The book that the preview panel shows before any interaction. */
export const defaultProjectSlug = "voice-product-discovery";
