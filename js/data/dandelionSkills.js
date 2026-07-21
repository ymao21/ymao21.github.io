export const featuredSkills = [
  'LLMs',
  'RAG',
  'Agents',
  'Multimodal',
  'Python',
  'Transformers',
  'CNNs',
  'PyTorch',
  'Data Science',
  'AI Systems',
];

export const supportingSkillGroups = [
  [
    'NLP', 'Vision', 'Attention', 'Encoders', 'Decoders', 'Embeddings', 'ViTs',
    'CLIP', 'LLaVA', 'Whisper', 'SpeechT5', 'Diffusion', 'GANs', 'Fine-tuning',
    'LoRA', 'Reasoning', 'Evaluation', 'Guardrails', 'Prompting', 'Retrieval',
    'Vector DBs', 'Knowledge Graphs', 'MCP', 'LangGraph', 'Agentic AI',
    'Computer Vision', 'Machine Learning',
  ],
  [
    'SQL', 'R', 'JavaScript', 'TypeScript', 'React', 'Flask', 'HTML', 'CSS',
    'Git', 'Docker', 'Linux', 'APIs', 'Node.js',
  ],
  [
    'Pandas', 'NumPy', 'Scikit-learn', 'PySpark', 'Spark', 'Statistics', 'EDA',
    'Forecasting', 'Clustering', 'Classification', 'Regression', 'XGBoost',
    'Random Forest', 'Feature Engineering', 'Visualization', 'Tableau',
    'Power BI', 'Experimentation', 'Similarity Search',
  ],
  [
    'AWS', 'GCP', 'BigQuery', 'Dataproc', 'Hive', 'HDFS', 'Automation',
    'Cloud Computing',
  ],
  [
    'Healthcare', 'Finance', 'Risk', 'Strategy', 'Product', 'Research',
    'Storytelling', 'Curiosity', 'Builder', 'Learning', 'Analytics', 'Consulting',
    'Communication', 'Problem Solving',
  ],
];

export const allSupportingSkills = supportingSkillGroups.flat();
export const allDandelionSkills = [...featuredSkills, ...allSupportingSkills];

/* Keeps mobile selections balanced across disciplines instead of truncating
   whole categories from the end of the source list. */
export function getDandelionSkills(supportingCount = allSupportingSkills.length) {
  const selected = [];
  let row = 0;
  while (selected.length < supportingCount) {
    let added = false;
    for (const group of supportingSkillGroups) {
      if (row < group.length && selected.length < supportingCount) {
        selected.push(group[row]);
        added = true;
      }
    }
    if (!added) break;
    row += 1;
  }
  return [...featuredSkills, ...selected];
}
