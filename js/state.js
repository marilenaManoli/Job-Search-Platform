const SKILLS_LIST = ['Python','Java','JavaScript','TypeScript','React','Vue','Node.js','SQL','PostgreSQL','MongoDB','Git','Docker','Kubernetes','AWS','GCP','Azure','PyTorch','TensorFlow','scikit-learn','Pandas','NumPy','REST APIs','GraphQL','C++','C#','Kotlin','Swift','Figma','Linux','Bash'];

const RECRUITERS = [
  { name:'Hays Switzerland',         type:'Recruitment agency',       url:'https://www.hays.ch' },
  { name:'Michael Page CH',          type:'Recruitment agency',       url:'https://www.michaelpage.ch' },
  { name:'Robert Walters CH',        type:'Recruitment agency',       url:'https://www.robertwalters.ch' },
  { name:'Swisslinx',                type:'Recruitment agency',       url:'https://www.swisslinx.com' },
  { name:'Darwin Recruitment',       type:'Recruitment agency',       url:'https://www.darwinrecruitment.com' },
  { name:'Jobs.ch',                  type:'Job board',                url:'https://www.jobs.ch' },
  { name:'SwissDevJobs',             type:'Tech board',               url:'https://swissdevjobs.ch' },
  { name:'DataCareer.ch',            type:'AI/Data board',            url:'https://datacareer.ch' },
  { name:'LinkedIn Jobs',            type:'Network + jobs',           url:'https://www.linkedin.com/jobs' },
  { name:'English Forum Switzerland',type:'Expat jobs forum',         url:'https://www.englishforum.ch/jobs' },
  { name:'Swisslinks',               type:'Swiss networking & jobs',  url:'https://www.swisslinks.com' },
  { name:'SwissDevOps',              type:'Tech community board',     url:'https://swissdevjobs.ch' },
  { name:'Google Zürich',            type:'Direct',                   url:'https://careers.google.com' },
];

let state = {
  apps: [
    { id:1, company:'ELCA Informatique SA', role:'Junior Java Engineer',        city:'Zürich', type:'junior', status:'saved', url:'', date:'', deadline:'', notes:'' },
    { id:2, company:'Supertext',            role:'Junior Software Engineer',     city:'Zürich', type:'junior', status:'saved', url:'', date:'', deadline:'', notes:'' },
    { id:3, company:'UBS',                  role:'Software Developer Internship',city:'Zürich', type:'intern', status:'saved', url:'', date:'', deadline:'', notes:'' },
  ],
  goals: [
    { id:1, text:'Apply to 5–10 roles this week',                               tag:'Apply',   done:false },
    { id:2, text:'Connect with 2 recruiters on LinkedIn (Hays, Michael Page)',   tag:'Network', done:false },
    { id:3, text:'Polish GitHub: add README to thesis project',                  tag:'Profile', done:false },
    { id:4, text:'Research AI product & HCI roles in Zürich',                   tag:'Research',done:false },
    { id:5, text:'Finalise 1-page Swiss-style CV',                              tag:'Profile', done:false },
  ],
  profile: {
    name:'', email:'', linkedin:'', github:'',
    bsc:'BSc Computer Science, University of Leeds',
    msc:'MSc Computer Science, University of Bern',
    grad:'August 2026',
    thesis:'Multimodal human-AI interaction system',
    permit:'',
    skills:['Python','JavaScript','Git'],
    otherSkills:'',
    langs:'English (fluent), German (learning)',
    roleTypes:['junior','ai','research','intern'],
    strengths:'I combine strong CS foundations with human-centered thinking. I enjoy working at the intersection of AI and user experience, and I communicate technical concepts clearly to non-technical stakeholders.',
    prefs:'Hybrid or remote preferred, collaborative international teams, startup or research environments, meaning-driven projects in AI or digital health'
  },
  scanResults:[],
  nextId:20,
  weekLabel:''
};

function load() {
  try {
    const saved = localStorage.getItem('sjsh_state');
    if (saved) { const p = JSON.parse(saved); Object.assign(state, p); }
  } catch(e) {}
}

function save() {
  try { localStorage.setItem('sjsh_state', JSON.stringify(state)); } catch(e) {}
}

function getApiKey() { return localStorage.getItem('sjsh_api') || ''; }

function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  if (!val) { toast('Enter an API key first'); return; }
  localStorage.setItem('sjsh_api', val);
  updateApiStatus();
  toast('API key saved ✓');
}
