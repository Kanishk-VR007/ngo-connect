import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import './NGODetail.css';

/* ─── Category config ────────────────────────────────────────────────────── */
const CAT_COLORS = {
  'Education': '#3b82f6', 'Healthcare': '#ef4444', 'Food & Nutrition': '#f59e0b',
  'Shelter': '#8b5cf6', 'Women Empowerment': '#ec4899', 'Child Welfare': '#06b6d4',
  'Environmental': '#10b981', 'Disaster Relief': '#f97316', 'Elderly Care': '#6366f1',
  'Skill Development': '#84cc16', 'Legal Aid': '#a78bfa', 'Other': '#6b7280'
};

const COVER_GRADIENTS = {
  'Education': 'linear-gradient(135deg,#1e3a8a 0%,#3b82f6 50%,#93c5fd 100%)',
  'Healthcare': 'linear-gradient(135deg,#7f1d1d 0%,#ef4444 50%,#fca5a5 100%)',
  'Food & Nutrition': 'linear-gradient(135deg,#78350f 0%,#f59e0b 50%,#fde68a 100%)',
  'Shelter': 'linear-gradient(135deg,#4c1d95 0%,#8b5cf6 50%,#c4b5fd 100%)',
  'Women Empowerment': 'linear-gradient(135deg,#831843 0%,#ec4899 50%,#fbcfe8 100%)',
  'Child Welfare': 'linear-gradient(135deg,#164e63 0%,#06b6d4 50%,#a5f3fc 100%)',
  'Environmental': 'linear-gradient(135deg,#064e3b 0%,#10b981 50%,#a7f3d0 100%)',
  'Disaster Relief': 'linear-gradient(135deg,#7c2d12 0%,#f97316 50%,#fed7aa 100%)',
  'Elderly Care': 'linear-gradient(135deg,#312e81 0%,#6366f1 50%,#c7d2fe 100%)',
  'Skill Development': 'linear-gradient(135deg,#365314 0%,#84cc16 50%,#d9f99d 100%)',
  'Legal Aid': 'linear-gradient(135deg,#4c1d95 0%,#a78bfa 50%,#ede9fe 100%)',
  'Other': 'linear-gradient(135deg,#1e293b 0%,#475569 50%,#cbd5e1 100%)',
};

/* ─── Deterministic "random" from string ────────────────────────────────── */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pick(arr, seed) { return arr[seed % arr.length]; }

/* ─── Unique post generator ─────────────────────────────────────────────── */
const POST_TEMPLATES = [
  // [0] milestone
  (ngo, h) => ({
    id: 1, timeAgo: pick(['1 hour ago', '2 hours ago', '3 hours ago'], h),
    avatar: '🏢', authorRole: 'Official Page', type: 'milestone',
    content: `We are proud to announce that ${ngo.name} has crossed the milestone of helping ${(ngo.statistics?.peopleHelped || 1000).toLocaleString()} people in ${ngo.location?.city}! This achievement belongs to every volunteer, donor, and community member who believed in our mission. Together we rise! 🙌`,
    image: null, likes: 100 + (h % 300), comments: 20 + (h % 60), shares: 30 + (h % 80),
    tags: ['Milestone', 'Community', ngo.serviceCategories?.[0] || 'NGO']
  }),
  // [1] event
  (ngo, h) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = pick(months, h + 3);
    const day = 5 + (h % 20);
    return {
      id: 2, timeAgo: pick(['1 day ago', '2 days ago', 'Yesterday'], h + 1),
      avatar: '📅', authorRole: 'Events Team', type: 'event',
      content: `📢 Save the Date! Join us for our upcoming ${ngo.serviceCategories?.[0] || 'Community'} awareness event on ${month} ${day}, 2026 at ${ngo.location?.city} Town Hall. Free entry. All are welcome. Register now and bring your family! 🎉`,
      image: 'event', likes: 60 + (h % 150), comments: 10 + (h % 40), shares: 20 + (h % 70),
      tags: ['Event', ngo.location?.city, ngo.serviceCategories?.[0] || 'NGO']
    };
  },
  // [2] volunteer call
  (ngo, h) => ({
    id: 3, timeAgo: pick(['3 days ago', '4 days ago', '5 days ago'], h + 2),
    avatar: '🤝', authorRole: 'Volunteer Desk', type: 'volunteer',
    content: `We are actively looking for passionate volunteers to join our ${ngo.serviceCategories?.[0] || 'community'} team in ${ngo.location?.city}! Whether you can spare 2 hours a week or 2 days a month — every bit of your time creates a ripple of change. Apply today! 🌊`,
    image: null, likes: 40 + (h % 120), comments: 15 + (h % 35), shares: 10 + (h % 50),
    tags: ['Volunteer', 'JoinUs', ngo.location?.city]
  }),
  // [3] impact story
  (ngo, h) => {
    const names = ['Priya', 'Ravi', 'Meena', 'Kumar', 'Lakshmi', 'Arjun', 'Devi', 'Senthil', 'Kavitha', 'Murugan'];
    const person = pick(names, h + 5);
    return {
      id: 4, timeAgo: pick(['1 week ago', '6 days ago', '5 days ago'], h + 3),
      avatar: '💬', authorRole: 'Impact Stories', type: 'story',
      content: `"Before ${ngo.name} reached our village, we had no access to proper ${(ngo.serviceCategories?.[0] || 'support').toLowerCase()} services. ${person} from our community is now ${getImpactLine(ngo.serviceCategories?.[0])} — all thanks to this incredible organisation." 💙`,
      image: 'story', likes: 200 + (h % 200), comments: 35 + (h % 50), shares: 60 + (h % 90),
      tags: ['ImpactStory', 'Hope', ngo.serviceCategories?.[0] || 'NGO']
    };
  },
  // [4] achievement
  (ngo, h) => ({
    id: 5, timeAgo: pick(['2 weeks ago', '10 days ago', '12 days ago'], h + 4),
    avatar: '🏆', authorRole: 'Achievements', type: 'achievement',
    content: `🎖️ We are honoured to share that ${ngo.name} has completed ${ngo.statistics?.projectsCompleted || 20} projects this year! From ${ngo.location?.city} to surrounding districts, our work continues to grow. Thank you to our ${ngo.statistics?.volunteersEngaged || 50} dedicated volunteers! 🙏`,
    image: 'achievement', likes: 280 + (h % 150), comments: 50 + (h % 40), shares: 80 + (h % 60),
    tags: ['Achievement', 'Gratitude', ngo.location?.state || 'TamilNadu']
  }),
  // [5] donation drive
  (ngo, h) => ({
    id: 6, timeAgo: pick(['3 weeks ago', '18 days ago', '20 days ago'], h + 6),
    avatar: '💰', authorRole: 'Fundraising', type: 'donation',
    content: `🌟 Donation Drive Alert! Help us raise funds for our upcoming ${ngo.serviceCategories?.[0] || 'community'} project in ${ngo.location?.city}. Every rupee counts — ₹500 can provide a week of ${getDonationImpact(ngo.serviceCategories?.[0])} for one family. Donate now via our website! 🙏`,
    image: null, likes: 90 + (h % 180), comments: 25 + (h % 45), shares: 40 + (h % 65),
    tags: ['Donate', 'FundRaiser', ngo.serviceCategories?.[0] || 'NGO']
  }),
];

function getImpactLine(cat) {
  const map = {
    'Education': 'the first graduate in her family',
    'Healthcare': 'recovering well after free surgery',
    'Food & Nutrition': 'no longer going to bed hungry',
    'Shelter': 'living in a safe, permanent home',
    'Women Empowerment': 'running her own small business',
    'Child Welfare': 'back in school and thriving',
    'Environmental': 'leading the village green initiative',
    'Disaster Relief': 'rebuilding her life after the floods',
    'Elderly Care': 'receiving daily care and companionship',
    'Skill Development': 'employed at a local company',
    'Legal Aid': 'free from an unjust legal battle',
  };
  return map[cat] || 'living a better life';
}

function getDonationImpact(cat) {
  const map = {
    'Education': 'school supplies and tutoring',
    'Healthcare': 'medicines and medical consultations',
    'Food & Nutrition': 'nutritious meals',
    'Shelter': 'shelter repair materials',
    'Women Empowerment': 'skill training sessions',
    'Child Welfare': 'child care and education',
    'Environmental': 'tree saplings and planting',
    'Disaster Relief': 'emergency relief supplies',
    'Elderly Care': 'elder care and medicines',
    'Skill Development': 'vocational training',
    'Legal Aid': 'legal consultation',
  };
  return map[cat] || 'community support';
}

/* ─── Unique gallery generator ──────────────────────────────────────────── */
const GALLERY_POOLS = {
  'Education': [['🎓', 'Classroom Drive'], ['📚', 'Book Distribution'], ['🖥️', 'Digital Literacy'], ['✏️', 'Scholarship Day'], ['🏫', 'School Inauguration'], ['📖', 'Reading Camp']],
  'Healthcare': [['🏥', 'Medical Camp'], ['💉', 'Vaccination Drive'], ['🩺', 'Free Checkup'], ['🧬', 'Health Awareness'], ['💊', 'Medicine Distribution'], ['🚑', 'Mobile Clinic']],
  'Food & Nutrition': [['🍲', 'Community Kitchen'], ['🥗', 'Nutrition Camp'], ['🌾', 'Food Drive'], ['🍱', 'Meal Distribution'], ['🥛', 'Child Nutrition'], ['🫙', 'Food Storage Drive']],
  'Shelter': [['🏠', 'Home Construction'], ['🔨', 'Repair Drive'], ['🏗️', 'New Colony'], ['🛖', 'Temp Shelter'], ['🏘️', 'Community Housing'], ['🪟', 'Renovation Camp']],
  'Women Empowerment': [['👩', 'Skill Training'], ['💼', 'Entrepreneurship'], ['⚖️', 'Legal Awareness'], ['🧵', 'Tailoring Class'], ['💻', 'Digital Skills'], ['🌸', 'Women\'s Day']],
  'Child Welfare': [['👶', 'Child Care Camp'], ['🎨', 'Art Workshop'], ['🎭', 'Cultural Event'], ['🏃', 'Sports Day'], ['📝', 'Exam Support'], ['🧸', 'Toy Drive']],
  'Environmental': [['🌱', 'Tree Plantation'], ['♻️', 'Recycling Drive'], ['🌊', 'Beach Cleanup'], ['🌿', 'Organic Farming'], ['☀️', 'Solar Awareness'], ['🐦', 'Wildlife Camp']],
  'Disaster Relief': [['🚨', 'Emergency Response'], ['🏕️', 'Relief Camp'], ['🛟', 'Rescue Ops'], ['📦', 'Aid Distribution'], ['🌀', 'Cyclone Prep'], ['🏚️', 'Rehab Drive']],
  'Elderly Care': [['👴', 'Elder Day'], ['🏡', 'Care Home Visit'], ['💊', 'Medicine Camp'], ['🎵', 'Cultural Program'], ['🧘', 'Yoga Session'], ['🤝', 'Companion Drive']],
  'Skill Development': [['🛠️', 'Vocational Training'], ['🔧', 'Workshop Day'], ['💡', 'Innovation Camp'], ['🎯', 'Job Fair'], ['📊', 'Business Skills'], ['🏆', 'Certification Day']],
  'Legal Aid': [['⚖️', 'Legal Camp'], ['📜', 'Rights Awareness'], ['🗣️', 'Community Forum'], ['🏛️', 'Court Support'], ['📋', 'Documentation Drive'], ['🤝', 'Mediation Day']],
  'Other': [['🤝', 'Community Drive'], ['🌟', 'Annual Event'], ['📢', 'Awareness Camp'], ['🎉', 'Celebration'], ['🏅', 'Award Ceremony'], ['💫', 'Outreach Program']],
};

const GALLERY_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#d4fc79,#96e6a1)',
  'linear-gradient(135deg,#f6d365,#fda085)',
  'linear-gradient(135deg,#89f7fe,#66a6ff)',
  'linear-gradient(135deg,#fddb92,#d1fdff)',
];

function buildGallery(ngo) {
  const h = hashStr(ngo._id || ngo.name || 'x');
  const cats = ngo.serviceCategories?.length ? ngo.serviceCategories : ['Other'];
  const items = [];
  cats.forEach(cat => {
    const pool = GALLERY_POOLS[cat] || GALLERY_POOLS['Other'];
    pool.forEach(([emoji, label]) => items.push({ emoji, label, cat }));
  });
  // Shuffle deterministically
  const shuffled = items.sort((a, b) => hashStr(a.label + h) - hashStr(b.label + h));
  return shuffled.slice(0, 6).map((item, i) => ({
    ...item,
    id: i,
    bg: GALLERY_GRADIENTS[(h + i) % GALLERY_GRADIENTS.length]
  }));
}

/* ─── Unique achievements generator ─────────────────────────────────────── */
const ACHIEVEMENT_POOLS = {
  'Education': [
    ['🏆', 'State Best Education NGO', 'Awarded by Tamil Nadu Education Department for excellence in rural education.'],
    ['📚', '10,000 Students Milestone', 'Successfully enrolled and supported 10,000 students across learning centres.'],
    ['💻', 'Digital Classroom Launch', 'Inaugurated 25 fully equipped digital classrooms in government schools.'],
    ['🎓', '100% Board Results', 'All students from our coaching centres passed their board exams.'],
    ['📜', 'ISO 9001 Certification', 'Received quality certification for our education delivery systems.'],
  ],
  'Healthcare': [
    ['🏥', 'Best Mobile Clinic Award', 'Recognised by IMA for outstanding mobile healthcare services.'],
    ['💉', '1 Lakh Vaccinations', 'Completed vaccination of 1,00,000 children across the district.'],
    ['🩺', 'Zero Maternal Deaths', 'Achieved zero maternal mortality in partnered villages for 3 consecutive years.'],
    ['🧬', 'Research Partnership', 'Partnered with AIIMS for community health research.'],
    ['🚑', '24/7 Emergency Network', 'Launched a 24/7 emergency response network covering 50 villages.'],
  ],
  'Food & Nutrition': [
    ['🍲', '1 Crore Meals Served', 'Served over 1 crore nutritious meals since inception.'],
    ['🌾', 'Zero Hunger Village', 'Declared 5 villages hunger-free under our nutrition program.'],
    ['🥗', 'National Food Award', 'Received national recognition for community kitchen excellence.'],
    ['🫙', 'Food Bank Launch', 'Established Tamil Nadu\'s first district-level community food bank.'],
    ['📜', 'FSSAI Certification', 'Certified by FSSAI for safe and hygienic food preparation.'],
  ],
  'Shelter': [
    ['🏠', '500 Homes Built', 'Constructed 500 permanent homes for disaster-affected families.'],
    ['🔨', 'Rapid Relief Record', 'Built 100 temporary shelters within 48 hours of a cyclone.'],
    ['🏗️', 'Green Housing Award', 'Recognised for eco-friendly construction practices.'],
    ['🏘️', 'Model Colony', 'Developed a model self-sustaining community colony.'],
    ['📜', 'State Housing Award', 'Awarded by Tamil Nadu Housing Board for community housing.'],
  ],
  'Women Empowerment': [
    ['👩', 'Best Women NGO Award', 'National award for outstanding contribution to women\'s empowerment.'],
    ['💼', '5,000 Entrepreneurs', 'Helped 5,000 women start their own micro-enterprises.'],
    ['⚖️', 'Legal Aid Milestone', 'Provided free legal aid to 2,000 women in distress.'],
    ['🌸', 'UN Recognition', 'Recognised by UN Women for gender equality initiatives.'],
    ['📜', 'State Women Award', 'Awarded by Tamil Nadu Women\'s Commission.'],
  ],
  'Child Welfare': [
    ['👶', 'Zero Child Labour', 'Achieved zero child labour in 20 partnered villages.'],
    ['🎨', 'Creative Arts Program', 'Launched state\'s first child creative arts therapy program.'],
    ['🏃', 'Sports Champions', 'Our children won medals at State Level Sports Meet.'],
    ['📝', '100% School Enrollment', 'Achieved 100% school enrollment in target communities.'],
    ['📜', 'NCPCR Recognition', 'Recognised by National Commission for Protection of Child Rights.'],
  ],
  'Environmental': [
    ['🌱', '1 Lakh Trees Planted', 'Planted over 1 lakh trees across Tamil Nadu.'],
    ['♻️', 'Zero Waste Village', 'Converted 3 villages to zero-waste communities.'],
    ['🌊', 'Coastal Cleanup Record', 'Cleaned 50 km of coastline in a single day.'],
    ['☀️', 'Solar Village', 'Helped 2 villages transition to 100% solar energy.'],
    ['📜', 'Green India Award', 'Received Green India Award from Ministry of Environment.'],
  ],
  'Disaster Relief': [
    ['🚨', 'Fastest Response Award', 'Recognised for 2-hour disaster response deployment.'],
    ['🛟', '10,000 Rescued', 'Rescued over 10,000 people during flood operations.'],
    ['📦', 'Relief Efficiency Award', 'Awarded for most efficient relief distribution in Tamil Nadu.'],
    ['🌀', 'Cyclone Preparedness', 'Trained 50 villages in cyclone preparedness.'],
    ['📜', 'NDMA Recognition', 'Recognised by National Disaster Management Authority.'],
  ],
  'Elderly Care': [
    ['👴', 'Best Elder Care NGO', 'Awarded by Tamil Nadu Social Welfare Department.'],
    ['🏡', '100 Elders Housed', 'Provided permanent housing to 100 abandoned elders.'],
    ['💊', 'Free Medicine Drive', 'Distributed free medicines to 5,000 senior citizens.'],
    ['🎵', 'Cultural Therapy Program', 'Launched India\'s first elder cultural therapy initiative.'],
    ['📜', 'WHO Recognition', 'Recognised by WHO for elder care best practices.'],
  ],
  'Skill Development': [
    ['🛠️', '10,000 Trained', 'Successfully trained 10,000 youth in vocational skills.'],
    ['🎯', '95% Placement Rate', 'Achieved 95% job placement for trained candidates.'],
    ['💡', 'Innovation Hub', 'Launched district\'s first youth innovation and startup hub.'],
    ['🏆', 'NSDC Partnership', 'Partnered with National Skill Development Corporation.'],
    ['📜', 'Skill India Award', 'Recognised under Skill India Mission.'],
  ],
  'Legal Aid': [
    ['⚖️', '10,000 Cases Resolved', 'Successfully resolved 10,000 legal cases for marginalised communities.'],
    ['📜', 'Bar Council Recognition', 'Recognised by Tamil Nadu Bar Council for pro-bono work.'],
    ['🗣️', 'Rights Awareness Campaign', 'Reached 1 lakh people through legal rights awareness drives.'],
    ['🏛️', 'Court Partnership', 'Partnered with District Court for free legal aid clinics.'],
    ['🤝', 'National Legal Award', 'Received National Legal Services Authority recognition.'],
  ],
  'Other': [
    ['🌟', 'Community Excellence Award', 'Recognised for outstanding community service.'],
    ['🏅', 'State NGO Award', 'Awarded by Tamil Nadu Government for social impact.'],
    ['🤝', '10 Years of Service', 'Celebrated a decade of community service.'],
    ['📜', 'ISO Certification', 'Received quality management certification.'],
    ['💫', 'National Recognition', 'Recognised at national level for community impact.'],
  ],
};

function buildAchievements(ngo) {
  const h = hashStr(ngo._id || ngo.name || 'x');
  const cats = ngo.serviceCategories?.length ? ngo.serviceCategories : ['Other'];
  const pool = [];
  cats.forEach(cat => {
    (ACHIEVEMENT_POOLS[cat] || ACHIEVEMENT_POOLS['Other']).forEach(a => pool.push(a));
  });
  const shuffled = pool.sort((a, b) => hashStr(a[1] + h) - hashStr(b[1] + h));
  const years = [2024, 2023, 2023, 2022, 2022];
  return shuffled.slice(0, 5).map(([icon, title, desc], i) => ({
    icon, title,
    desc: desc.replace('the district', ngo.location?.city || 'the district'),
    year: years[i]
  }));
}

/* ─── Service descriptions ───────────────────────────────────────────────── */
function getServiceDesc(cat) {
  const map = {
    'Education': 'Providing quality education, scholarships, and learning resources to underprivileged communities.',
    'Healthcare': 'Offering free medical camps, health screenings, and access to essential medicines.',
    'Food & Nutrition': 'Running community kitchens and nutrition programs for food-insecure families.',
    'Shelter': 'Building and rehabilitating homes for disaster-affected and homeless families.',
    'Women Empowerment': 'Skill training, legal support, and entrepreneurship programs for women.',
    'Child Welfare': 'Child protection, education support, and welfare programs for vulnerable children.',
    'Environmental': 'Tree planting, waste management, and environmental awareness campaigns.',
    'Disaster Relief': 'Emergency response, relief distribution, and rehabilitation after disasters.',
    'Elderly Care': 'Day care centers, medical support, and companionship programs for senior citizens.',
    'Skill Development': 'Vocational training and employment linkage for youth and adults.',
    'Legal Aid': 'Free legal consultation and representation for marginalized communities.',
    'Other': 'Various community support and development programs.'
  };
  return map[cat] || 'Community support and development services.';
}

function getCatEmoji(cat) {
  const map = {
    'Education': '🎓', 'Healthcare': '🏥', 'Food & Nutrition': '🍲',
    'Shelter': '🏠', 'Women Empowerment': '👩', 'Child Welfare': '👶',
    'Environmental': '🌱', 'Disaster Relief': '🚨', 'Elderly Care': '👴',
    'Skill Development': '🛠️', 'Legal Aid': '⚖️', 'Other': '🤝'
  };
  return map[cat] || '🤝';
}

/* ─── Post Card ──────────────────────────────────────────────────────────── */
const POST_IMAGE_GRADIENTS = {
  event: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  achievement: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
  story: 'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)',
  donation: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
};

const PostCard = ({ post, ngo }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const postImageLabels = {
    event: `${ngo.location?.city} · Upcoming Event`,
    achievement: `${(ngo.statistics?.projectsCompleted || 20)} Projects Completed`,
    story: `Stories from ${ngo.location?.city}`,
    donation: `Help us raise funds for ${ngo.location?.city}`,
  };

  const postImageEmojis = { event: '📅', achievement: '🏆', story: '💬', donation: '💰' };

  return (
    <div className="nd-post-card">
      <div className="nd-post-header">
        <div className="nd-post-avatar">{post.avatar}</div>
        <div className="nd-post-meta">
          <span className="nd-post-author">{ngo.name}</span>
          <span className="nd-post-role">{post.authorRole}</span>
          <span className="nd-post-time">{post.timeAgo}</span>
        </div>
        <button className="nd-post-follow">+ Follow</button>
      </div>

      <p className="nd-post-content">{post.content}</p>

      {post.image && (
        <div className="nd-post-image" style={{ background: POST_IMAGE_GRADIENTS[post.image] || POST_IMAGE_GRADIENTS.event }}>
          <div className="nd-post-image-inner">
            <span className="nd-post-image-emoji">{postImageEmojis[post.image]}</span>
            <span className="nd-post-image-label">{postImageLabels[post.image]}</span>
          </div>
        </div>
      )}

      <div className="nd-post-tags">
        {post.tags.map(tag => (
          <span key={tag} className="nd-post-tag">#{tag.replace(/[\s&]/g, '')}</span>
        ))}
      </div>

      <div className="nd-post-counts">
        <span>👍 {likeCount.toLocaleString()}</span>
        <span className="nd-post-counts-right">{post.comments} comments · {post.shares} shares</span>
      </div>

      <div className="nd-post-actions">
        <button className={`nd-post-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>👍 Like</button>
        <button className="nd-post-action-btn" onClick={() => setShowComments(!showComments)}>💬 Comment</button>
        <button className="nd-post-action-btn">↗️ Share</button>
        <button className="nd-post-action-btn">📤 Send</button>
      </div>

      {showComments && (
        <div className="nd-comment-box">
          <div className="nd-comment-avatar">👤</div>
          <input className="nd-comment-input" placeholder="Add a comment…" />
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const NGODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [following, setFollowing] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({ serviceCategory: '', title: '', description: '', urgency: 'medium' });

  useEffect(() => { fetchNGO(); }, [id]); // eslint-disable-line

  const fetchNGO = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/ngos/${id}`);
      const data = res.data;
      setNgo(data.data || data);
    } catch {
      setNgo(getDummyNGO(id));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', { ...requestData, ngoId: id });
      alert('Service request submitted!');
      setShowRequestForm(false);
    } catch { alert('Error submitting request'); }
  };

  if (loading) return <LoadingScreen message="Loading NGO profile…" />;
  if (!ngo) return (
    <div className="nd-not-found">
      <h2>NGO not found</h2>
      <button onClick={() => navigate('/ngos')}>← Back to NGOs</button>
    </div>
  );

  const h = hashStr(ngo._id || ngo.name || 'x');
  const primaryCat = ngo.serviceCategories?.[0] || 'Other';
  const coverGradient = COVER_GRADIENTS[primaryCat] || COVER_GRADIENTS['Other'];

  // Build unique content for this NGO
  const posts = POST_TEMPLATES.map((fn, i) => fn(ngo, h + i * 7));
  const gallery = buildGallery(ngo);
  const achievements = buildAchievements(ngo);

  const followers = Math.floor((ngo.statistics?.peopleHelped || 500) * 0.31 + 120);
  const connections = Math.floor((ngo.statistics?.volunteersEngaged || 50) * 2.4 + 80);

  return (
    <div className="nd-page">

      {/* Cover */}
      <div className="nd-cover" style={{ background: coverGradient }}>
        <div className="nd-cover-overlay">
          <div className="nd-cover-pattern" />
          <div className="nd-cover-icons">
            {(ngo.serviceCategories || [primaryCat]).map((cat, i) => (
              <span key={i} className="nd-cover-cat-icon" style={{ animationDelay: `${i * 0.35}s` }}>
                {getCatEmoji(cat)}
              </span>
            ))}
          </div>
        </div>
        <button className="nd-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {/* Profile Card */}
      <div className="nd-profile-card-wrap">
        <div className="nd-profile-card">
          <div className="nd-logo-wrap">
            {ngo.logo
              ? <img src={ngo.logo} alt={ngo.name} className="nd-logo-img" />
              : <div className="nd-logo-placeholder" style={{ background: coverGradient }}>{ngo.name?.charAt(0) || '?'}</div>
            }
            {ngo.isVerified && <span className="nd-verified-badge" title="Verified NGO">✓</span>}
          </div>

          <div className="nd-profile-info">
            <div className="nd-profile-top">
              <div>
                <h1 className="nd-name">
                  {ngo.name}
                  {ngo.isVerified && <span className="nd-verified-text">Verified NGO</span>}
                </h1>
                <p className="nd-tagline">{ngo.ngoType || 'Service'} Organization · {primaryCat}</p>
                <p className="nd-location-line">
                  📍 {ngo.location?.city}, {ngo.location?.state}, {ngo.location?.country || 'India'}
                  {ngo.foundedYear && <span className="nd-founded"> · Est. {ngo.foundedYear}</span>}
                </p>
                <p className="nd-follower-line">
                  <span>{followers.toLocaleString()} followers</span>
                  <span className="nd-dot">·</span>
                  <span>{connections.toLocaleString()} connections</span>
                </p>
              </div>
              <div className="nd-action-btns">
                <button className={`nd-btn-follow ${following ? 'following' : ''}`} onClick={() => setFollowing(!following)}>
                  {following ? '✓ Following' : '+ Follow'}
                </button>
                {isAuthenticated && (
                  <button className="nd-btn-request" onClick={() => setShowRequestForm(true)}>Request Service</button>
                )}
                <button className="nd-btn-more">•••</button>
              </div>
            </div>
            <div className="nd-cat-tags">
              {(ngo.serviceCategories || []).map(cat => (
                <span key={cat} className="nd-cat-tag"
                  style={{ background: CAT_COLORS[cat] + '20', color: CAT_COLORS[cat], borderColor: CAT_COLORS[cat] + '40' }}>
                  {getCatEmoji(cat)} {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="nd-stats-bar">
          {[
            { icon: '👥', value: (ngo.statistics?.peopleHelped || 0).toLocaleString(), label: 'People Helped' },
            { icon: '✅', value: ngo.statistics?.projectsCompleted || 0, label: 'Projects Done' },
            { icon: '🤝', value: ngo.statistics?.volunteersEngaged || 0, label: 'Volunteers' },
            { icon: '💰', value: `₹${((ngo.statistics?.donationsReceived || 0) / 100000).toFixed(1)}L`, label: 'Donations' },
            { icon: '⭐', value: ngo.rating?.average ? ngo.rating.average.toFixed(1) : '4.5', label: `Rating (${ngo.rating?.count || 0})` },
          ].map((s, i) => (
            <div key={i} className="nd-stat-item">
              <span className="nd-stat-icon">{s.icon}</span>
              <span className="nd-stat-value">{s.value}</span>
              <span className="nd-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="nd-main">

        {/* Left Column */}
        <div className="nd-left-col">

          {/* About */}
          <div className="nd-card">
            <h3 className="nd-card-title">About</h3>
            <p className="nd-about-text">{ngo.description}</p>
            <div className="nd-about-details">
              {ngo.email && <div className="nd-detail-row"><span className="nd-detail-icon">✉️</span><a href={`mailto:${ngo.email}`}>{ngo.email}</a></div>}
              {ngo.phone && <div className="nd-detail-row"><span className="nd-detail-icon">📞</span><span>{ngo.phone}</span></div>}
              {ngo.website && <div className="nd-detail-row"><span className="nd-detail-icon">🌐</span><a href={ngo.website} target="_blank" rel="noopener noreferrer">{ngo.website}</a></div>}
              {ngo.registrationNumber && <div className="nd-detail-row"><span className="nd-detail-icon">📋</span><span>Reg. No: {ngo.registrationNumber}</span></div>}
              {ngo.teamSize > 0 && <div className="nd-detail-row"><span className="nd-detail-icon">👤</span><span>{ngo.teamSize} team members</span></div>}
            </div>
            {ngo.socialMedia && Object.values(ngo.socialMedia).some(Boolean) && (
              <div className="nd-social-links">
                {ngo.socialMedia.facebook && <a href={ngo.socialMedia.facebook} className="nd-social-btn fb" target="_blank" rel="noopener noreferrer">f</a>}
                {ngo.socialMedia.twitter && <a href={ngo.socialMedia.twitter} className="nd-social-btn tw" target="_blank" rel="noopener noreferrer">𝕏</a>}
                {ngo.socialMedia.instagram && <a href={ngo.socialMedia.instagram} className="nd-social-btn ig" target="_blank" rel="noopener noreferrer">📷</a>}
                {ngo.socialMedia.linkedin && <a href={ngo.socialMedia.linkedin} className="nd-social-btn li" target="_blank" rel="noopener noreferrer">in</a>}
              </div>
            )}
          </div>

          {/* Gallery — unique per NGO */}
          <div className="nd-card">
            <div className="nd-card-header-row">
              <h3 className="nd-card-title">Gallery</h3>
              <span className="nd-card-see-all">See all photos</span>
            </div>
            <div className="nd-gallery-grid">
              {gallery.map(item => (
                <div key={item.id} className="nd-gallery-item" style={{ background: item.bg }}>
                  <span className="nd-gallery-emoji">{item.emoji}</span>
                  <span className="nd-gallery-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="nd-card">
            <h3 className="nd-card-title">Location</h3>
            <div className="nd-location-map-placeholder">
              <div className="nd-map-pin-anim">📍</div>
              <p className="nd-location-address">{ngo.location?.address}</p>
              <p className="nd-location-city">{ngo.location?.city}, {ngo.location?.state} {ngo.location?.pincode}</p>
              <button className="nd-map-btn" onClick={() => navigate('/ngo-map')}>🗺️ View on Map</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="nd-right-col">
          <div className="nd-tabs">
            {['posts', 'about', 'achievements'].map(tab => (
              <button key={tab} className={`nd-tab ${activeTab === tab ? 'nd-tab-active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="nd-posts-feed">
              <div className="nd-create-post">
                <div className="nd-create-avatar">👤</div>
                <button className="nd-create-input">Share an update about this NGO…</button>
              </div>
              {posts.map(post => <PostCard key={post.id} post={post} ngo={ngo} />)}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="nd-about-tab">
              <div className="nd-card">
                <h3 className="nd-card-title">Organization Overview</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '16px' }}>{ngo.description}</p>
                <div className="nd-about-grid">
                  {[
                    ['Type', ngo.ngoType || 'Service'],
                    ['Founded', ngo.foundedYear || 'N/A'],
                    ['Team Size', ngo.teamSize ? `${ngo.teamSize} members` : 'N/A'],
                    ['Registration', ngo.registrationNumber],
                    ['Location', `${ngo.location?.city}, ${ngo.location?.state}`],
                    ['Status', ngo.isActive ? '✓ Active' : 'Inactive'],
                  ].map(([label, value]) => (
                    <div key={label} className="nd-about-item">
                      <span className="nd-about-label">{label}</span>
                      <span className="nd-about-value" style={label === 'Status' ? { color: '#10b981' } : {}}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="nd-card">
                <h3 className="nd-card-title">Services Offered</h3>
                <div className="nd-services-list">
                  {(ngo.serviceCategories || []).map(cat => (
                    <div key={cat} className="nd-service-row" style={{ borderLeftColor: CAT_COLORS[cat] }}>
                      <span className="nd-service-emoji">{getCatEmoji(cat)}</span>
                      <div>
                        <strong>{cat}</strong>
                        <p>{getServiceDesc(cat)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="nd-achievements-tab">
              {achievements.map((ach, i) => (
                <div key={i} className="nd-achievement-card">
                  <div className="nd-ach-icon">{ach.icon}</div>
                  <div className="nd-ach-content">
                    <div className="nd-ach-header">
                      <h4>{ach.title}</h4>
                      <span className="nd-ach-year">{ach.year}</span>
                    </div>
                    <p>{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Request Modal */}
      {showRequestForm && (
        <div className="nd-modal-overlay" onClick={() => setShowRequestForm(false)}>
          <div className="nd-modal" onClick={e => e.stopPropagation()}>
            <div className="nd-modal-header">
              <h2>Request Service from {ngo.name}</h2>
              <button className="nd-modal-close" onClick={() => setShowRequestForm(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestSubmit} className="nd-modal-form">
              <div className="nd-form-group">
                <label>Service Category</label>
                <select value={requestData.serviceCategory} onChange={e => setRequestData({ ...requestData, serviceCategory: e.target.value })} required>
                  <option value="">Select a category</option>
                  {(ngo.serviceCategories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="nd-form-group">
                <label>Request Title</label>
                <input type="text" value={requestData.title} onChange={e => setRequestData({ ...requestData, title: e.target.value })} placeholder="Brief title for your request" required />
              </div>
              <div className="nd-form-group">
                <label>Description</label>
                <textarea value={requestData.description} onChange={e => setRequestData({ ...requestData, description: e.target.value })} rows="4" placeholder="Describe your need in detail…" required />
              </div>
              <div className="nd-form-group">
                <label>Urgency Level</label>
                <select value={requestData.urgency} onChange={e => setRequestData({ ...requestData, urgency: e.target.value })}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
              <div className="nd-modal-actions">
                <button type="submit" className="nd-btn-submit">Submit Request</button>
                <button type="button" className="nd-btn-cancel" onClick={() => setShowRequestForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Fallback dummy NGO lookup (matches NearbyNGOs DUMMY_NGOS d1-d20) ──── */
const DUMMY_NGO_DB = {
  d1: {
    _id: 'd1', name: 'Chennai Care Foundation', ngoType: 'Charitable',
    description: 'Chennai Care Foundation is a leading NGO dedicated to improving lives across Tamil Nadu through education, healthcare, and community development programs. We run 12 learning centres across the city with over 2,000 students enrolled and 3 mobile health units serving underserved communities.',
    registrationNumber: 'TN-CHN-001-2010', email: 'info@chennaicarefd.org', phone: '044-23456789',
    website: 'https://chennaicarefd.org', foundedYear: 2010, teamSize: 85, isVerified: true, isActive: true,
    location: { address: '45, Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600002', coordinates: [80.2707, 13.0827] },
    serviceCategories: ['Education', 'Healthcare', 'Child Welfare'],
    statistics: { peopleHelped: 12000, projectsCompleted: 48, donationsReceived: 2500000, volunteersEngaged: 320 },
    rating: { average: 4.7, count: 210 },
    socialMedia: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' }
  },
  d2: {
    _id: 'd2', name: 'Coimbatore Green Earth NGO', ngoType: 'Advocacy',
    description: 'Dedicated to environmental conservation, tree plantation drives, and clean energy awareness across Coimbatore district. We have planted over 50,000 trees since inception and converted 3 villages to zero-waste communities. Our solar awareness programs have reached 200+ schools.',
    registrationNumber: 'TN-CBE-002-2012', email: 'contact@cbegreen.org', phone: '0422-3456789',
    website: '', foundedYear: 2012, teamSize: 42, isVerified: true, isActive: true,
    location: { address: '12, Avinashi Road', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', pincode: '641018', coordinates: [76.9558, 11.0168] },
    serviceCategories: ['Environmental'],
    statistics: { peopleHelped: 8500, projectsCompleted: 35, donationsReceived: 980000, volunteersEngaged: 180 },
    rating: { average: 4.5, count: 95 },
    socialMedia: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' }
  },
  d3: {
    _id: 'd3', name: 'Madurai Women Empowerment Trust', ngoType: 'Empowerment',
    description: 'Empowering rural women through skill development, micro-finance support, and legal aid in Madurai and surrounding villages. Over 3,000 women have been trained in vocational skills including tailoring, handicrafts, and digital literacy. We have helped 500+ women start their own micro-enterprises.',
    registrationNumber: 'TN-MDU-003-2008', email: 'mwet@maduraiwomen.org', phone: '0452-2345678',
    website: 'https://maduraiwomen.org', foundedYear: 2008, teamSize: 60, isVerified: true, isActive: true,
    location: { address: '78, Meenakshi Amman Kovil Street', city: 'Madurai', state: 'Tamil Nadu', country: 'India', pincode: '625001', coordinates: [78.1198, 9.9252] },
    serviceCategories: ['Women Empowerment', 'Skill Development', 'Legal Aid'],
    statistics: { peopleHelped: 9800, projectsCompleted: 62, donationsReceived: 1750000, volunteersEngaged: 240 },
    rating: { average: 4.8, count: 175 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' }
  },
  d4: {
    _id: 'd4', name: 'Trichy Child Welfare Society', ngoType: 'Service',
    description: 'Protecting children from abuse, trafficking, and child labour in Tiruchirappalli. We operate 2 shelter homes housing 80 children and run awareness campaigns in 150+ schools. Our legal team has successfully rescued 200+ children from exploitative situations.',
    registrationNumber: 'TN-TRY-004-2011', email: 'info@trichychildwelfare.org', phone: '0431-2234567',
    website: '', foundedYear: 2011, teamSize: 38, isVerified: true, isActive: true,
    location: { address: '34, Rockfort Road', city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', pincode: '620001', coordinates: [78.6869, 10.7905] },
    serviceCategories: ['Child Welfare', 'Education'],
    statistics: { peopleHelped: 5600, projectsCompleted: 29, donationsReceived: 870000, volunteersEngaged: 150 },
    rating: { average: 4.6, count: 88 },
    socialMedia: { facebook: 'https://facebook.com', twitter: 'https://twitter.com' }
  },
  d5: {
    _id: 'd5', name: 'Salem Hunger Free Mission', ngoType: 'Charitable',
    description: 'Fighting hunger and malnutrition in Salem district by running community kitchens, distributing nutritious meals to daily wage workers and school children. We serve 1,500 meals daily across 5 community kitchens and have declared 2 villages hunger-free.',
    registrationNumber: 'TN-SLM-005-2015', email: 'salem.hungerfree@gmail.com', phone: '0427-2345671',
    website: '', foundedYear: 2015, teamSize: 25, isVerified: false, isActive: true,
    location: { address: '56, Omalur Main Road', city: 'Salem', state: 'Tamil Nadu', country: 'India', pincode: '636001', coordinates: [78.1460, 11.6643] },
    serviceCategories: ['Food & Nutrition'],
    statistics: { peopleHelped: 14000, projectsCompleted: 18, donationsReceived: 560000, volunteersEngaged: 95 },
    rating: { average: 4.4, count: 62 },
    socialMedia: { instagram: 'https://instagram.com' }
  },
  d6: {
    _id: 'd6', name: 'Tirunelveli Elderly Care Centre', ngoType: 'Service',
    description: 'Providing dignified care, medical support, and companionship to abandoned elderly citizens in Tirunelveli. We operate two residential care homes housing 120 senior citizens, run daily medical clinics, and organise cultural programs to keep our elders engaged and happy.',
    registrationNumber: 'TN-TVL-006-2009', email: 'care@tvlelderly.org', phone: '0462-2234560',
    website: 'https://tvlelderly.org', foundedYear: 2009, teamSize: 32, isVerified: true, isActive: true,
    location: { address: '23, Palayamkottai Road', city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', pincode: '627001', coordinates: [77.6965, 8.7139] },
    serviceCategories: ['Elderly Care', 'Healthcare'],
    statistics: { peopleHelped: 3200, projectsCompleted: 22, donationsReceived: 720000, volunteersEngaged: 110 },
    rating: { average: 4.9, count: 130 },
    socialMedia: { facebook: 'https://facebook.com', linkedin: 'https://linkedin.com' }
  },
  d7: {
    _id: 'd7', name: 'Vellore Health & Sanitation Trust', ngoType: 'Service',
    description: 'Improving public health through sanitation drives, clean water projects, and mobile health camps across rural Vellore district villages. We have installed 500+ toilets, provided clean drinking water to 80 villages, and conducted 200+ free health camps reaching 22,000 beneficiaries.',
    registrationNumber: 'TN-VLR-007-2013', email: 'vellorehealth@trust.org', phone: '0416-2234561',
    website: '', foundedYear: 2013, teamSize: 48, isVerified: true, isActive: true,
    location: { address: '89, Katpadi Road', city: 'Vellore', state: 'Tamil Nadu', country: 'India', pincode: '632001', coordinates: [79.1325, 12.9165] },
    serviceCategories: ['Healthcare', 'Environmental'],
    statistics: { peopleHelped: 22000, projectsCompleted: 41, donationsReceived: 1100000, volunteersEngaged: 200 },
    rating: { average: 4.5, count: 108 },
    socialMedia: { twitter: 'https://twitter.com', instagram: 'https://instagram.com' }
  },
  d8: {
    _id: 'd8', name: 'Erode Skill India Foundation', ngoType: 'Empowerment',
    description: 'Providing free vocational training in tailoring, weaving, computer skills, and electrical work to unemployed youth in Erode district. Our 95% placement rate is a testament to our quality training. We have partnered with 50+ local businesses to ensure job placements for our graduates.',
    registrationNumber: 'TN-ERD-008-2016', email: 'erode.skill@foundation.org', phone: '0424-2234562',
    website: '', foundedYear: 2016, teamSize: 30, isVerified: false, isActive: true,
    location: { address: '12, Brough Road', city: 'Erode', state: 'Tamil Nadu', country: 'India', pincode: '638001', coordinates: [77.7172, 11.3410] },
    serviceCategories: ['Skill Development', 'Education'],
    statistics: { peopleHelped: 6700, projectsCompleted: 24, donationsReceived: 430000, volunteersEngaged: 85 },
    rating: { average: 4.3, count: 55 },
    socialMedia: { facebook: 'https://facebook.com' }
  },
  d9: {
    _id: 'd9', name: 'Tiruppur Garment Workers Welfare', ngoType: 'Advocacy',
    description: 'Supporting garment industry workers and their families with healthcare, education for children, and legal rights awareness in Tiruppur. We advocate for fair wages, safe working conditions, and have helped 500+ workers resolve labour disputes through our free legal aid cell.',
    registrationNumber: 'TN-TPR-009-2014', email: 'tprworkers@welfare.org', phone: '0421-2234563',
    website: '', foundedYear: 2014, teamSize: 35, isVerified: true, isActive: true,
    location: { address: '45, Avinashi Road', city: 'Tiruppur', state: 'Tamil Nadu', country: 'India', pincode: '641601', coordinates: [77.3411, 11.1085] },
    serviceCategories: ['Skill Development', 'Child Welfare', 'Healthcare'],
    statistics: { peopleHelped: 11000, projectsCompleted: 31, donationsReceived: 650000, volunteersEngaged: 130 },
    rating: { average: 4.4, count: 72 },
    socialMedia: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' }
  },
  d10: {
    _id: 'd10', name: 'Thanjavur Heritage & Community Trust', ngoType: 'Community-based',
    description: 'Preserving cultural heritage while providing food, shelter, and education support to marginalized communities in Thanjavur district. We run 3 community kitchens, a heritage school teaching classical arts, and a shelter home for 60 homeless individuals.',
    registrationNumber: 'TN-TNJ-011-2007', email: 'thanjavurheritage@trust.org', phone: '04362-234565',
    website: 'https://thanjavurheritage.org', foundedYear: 2007, teamSize: 55, isVerified: true, isActive: true,
    location: { address: '3, Gandhiji Road', city: 'Thanjavur', state: 'Tamil Nadu', country: 'India', pincode: '613001', coordinates: [79.1378, 10.7870] },
    serviceCategories: ['Education', 'Food & Nutrition', 'Shelter'],
    statistics: { peopleHelped: 18000, projectsCompleted: 70, donationsReceived: 2100000, volunteersEngaged: 280 },
    rating: { average: 4.7, count: 155 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' }
  },
  d11: {
    _id: 'd11', name: 'Cuddalore Disaster Relief Network', ngoType: 'Service',
    description: 'Providing rapid disaster relief, rehabilitation, and community resilience training to coastal communities in Cuddalore district prone to cyclones and floods. We have rescued 10,000+ people during flood operations and built 500 permanent homes for disaster-affected families.',
    registrationNumber: 'TN-CDL-013-2005', email: 'cuddalore.relief@network.org', phone: '04142-234567',
    website: 'https://cuddalorerelief.org', foundedYear: 2005, teamSize: 70, isVerified: true, isActive: true,
    location: { address: '22, Beach Road', city: 'Cuddalore', state: 'Tamil Nadu', country: 'India', pincode: '607001', coordinates: [79.7681, 11.7480] },
    serviceCategories: ['Disaster Relief', 'Shelter', 'Food & Nutrition'],
    statistics: { peopleHelped: 35000, projectsCompleted: 55, donationsReceived: 3200000, volunteersEngaged: 400 },
    rating: { average: 4.8, count: 195 },
    socialMedia: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', instagram: 'https://instagram.com' }
  },
  d12: {
    _id: 'd12', name: 'Nilgiris Tribal Welfare Organisation', ngoType: 'Advocacy',
    description: 'Advocating for the rights and welfare of indigenous tribal communities in the Nilgiris, providing healthcare, education, and land rights support. We have secured land rights for 200+ tribal families and run 5 community schools in remote forest areas.',
    registrationNumber: 'TN-NLG-021-2004', email: 'nilgiristribe@welfare.org', phone: '0423-2234575',
    website: '', foundedYear: 2004, teamSize: 52, isVerified: true, isActive: true,
    location: { address: '5, Ooty Main Road', city: 'Ooty', state: 'Tamil Nadu', country: 'India', pincode: '643001', coordinates: [76.7337, 11.4102] },
    serviceCategories: ['Education', 'Healthcare', 'Legal Aid'],
    statistics: { peopleHelped: 21000, projectsCompleted: 65, donationsReceived: 1900000, volunteersEngaged: 220 },
    rating: { average: 4.9, count: 165 },
    socialMedia: { facebook: 'https://facebook.com', linkedin: 'https://linkedin.com' }
  },
  d13: {
    _id: 'd13', name: 'Tiruvannamalai Spiritual & Social Service', ngoType: 'Faith-based',
    description: 'Inspired by the spiritual heritage of Tiruvannamalai, this NGO provides free meals, medical care, and shelter to pilgrims and homeless individuals. We serve 2,000 free meals daily, operate a 100-bed shelter home, and run weekly free medical camps at the temple premises.',
    registrationNumber: 'TN-TVN-025-2003', email: 'tvnservice@spiritual.org', phone: '04175-234579',
    website: 'https://tvnservice.org', foundedYear: 2003, teamSize: 65, isVerified: true, isActive: true,
    location: { address: '1, Arunachala Temple Road', city: 'Tiruvannamalai', state: 'Tamil Nadu', country: 'India', pincode: '606601', coordinates: [79.0747, 12.2253] },
    serviceCategories: ['Food & Nutrition', 'Shelter', 'Healthcare'],
    statistics: { peopleHelped: 42000, projectsCompleted: 80, donationsReceived: 3800000, volunteersEngaged: 350 },
    rating: { average: 4.9, count: 230 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' }
  },
  d14: {
    _id: 'd14', name: 'Kanyakumari Coastal Welfare Trust', ngoType: 'Charitable',
    description: 'Protecting the environment and supporting fishing communities at the southernmost tip of India. We run beach clean-up drives, fisher children scholarship programs, and coastal ecosystem restoration projects. Our annual coastal cleanup covers 50 km of shoreline.',
    registrationNumber: 'TN-KKM-020-2008', email: 'kanyakumari.cwt@trust.org', phone: '04652-234574',
    website: 'https://kanyakumaritrust.org', foundedYear: 2008, teamSize: 38, isVerified: true, isActive: true,
    location: { address: '2, Vivekananda Puram', city: 'Kanyakumari', state: 'Tamil Nadu', country: 'India', pincode: '629702', coordinates: [77.5385, 8.0883] },
    serviceCategories: ['Environmental', 'Child Welfare', 'Education'],
    statistics: { peopleHelped: 9500, projectsCompleted: 42, donationsReceived: 870000, volunteersEngaged: 145 },
    rating: { average: 4.8, count: 118 },
    socialMedia: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' }
  },
  d15: {
    _id: 'd15', name: 'Nagapattinam Tsunami Survivors Network', ngoType: 'Community-based',
    description: 'Born from the 2004 tsunami tragedy, this network supports survivors and coastal communities in Nagapattinam with disaster preparedness, livelihood restoration, and children education. We have rebuilt 300 homes and trained 5,000 people in disaster preparedness.',
    registrationNumber: 'TN-NGP-028-2005', email: 'nagapattinam.tsn@network.org', phone: '04365-234582',
    website: '', foundedYear: 2005, teamSize: 45, isVerified: true, isActive: true,
    location: { address: '14, Collector Office Road', city: 'Nagapattinam', state: 'Tamil Nadu', country: 'India', pincode: '611001', coordinates: [79.8449, 10.7672] },
    serviceCategories: ['Disaster Relief', 'Child Welfare'],
    statistics: { peopleHelped: 28000, projectsCompleted: 50, donationsReceived: 2800000, volunteersEngaged: 300 },
    rating: { average: 4.8, count: 180 },
    socialMedia: { facebook: 'https://facebook.com', twitter: 'https://twitter.com' }
  },
  d16: {
    _id: 'd16', name: 'Ranipet Industrial Workers Welfare', ngoType: 'Advocacy',
    description: 'Protecting the rights of leather and chemical industry workers in Ranipet, providing legal aid, health checkups, and children education support. We have resolved 800+ labour disputes and provide free annual health checkups to 3,000 industrial workers.',
    registrationNumber: 'TN-RNP-026-2013', email: 'ranipet.workers@welfare.org', phone: '04172-234580',
    website: '', foundedYear: 2013, teamSize: 28, isVerified: false, isActive: true,
    location: { address: '7, Industrial Estate Road', city: 'Ranipet', state: 'Tamil Nadu', country: 'India', pincode: '632401', coordinates: [79.3328, 12.9224] },
    serviceCategories: ['Legal Aid', 'Healthcare', 'Child Welfare'],
    statistics: { peopleHelped: 8200, projectsCompleted: 28, donationsReceived: 520000, volunteersEngaged: 90 },
    rating: { average: 4.3, count: 58 },
    socialMedia: { twitter: 'https://twitter.com' }
  },
  d17: {
    _id: 'd17', name: 'Dharmapuri Drought Relief Mission', ngoType: 'Service',
    description: 'Providing water conservation, drought relief, and sustainable farming support to farmers in water-scarce Dharmapuri district. We have built 50 check dams, restored 20 traditional water bodies, and trained 2,000 farmers in drought-resistant farming techniques.',
    registrationNumber: 'TN-DPR-023-2009', email: 'dharmapuri.drm@mission.org', phone: '04342-234577',
    website: '', foundedYear: 2009, teamSize: 27, isVerified: true, isActive: true,
    location: { address: '18, Collector Office Road', city: 'Dharmapuri', state: 'Tamil Nadu', country: 'India', pincode: '636701', coordinates: [78.1582, 12.1277] },
    serviceCategories: ['Disaster Relief', 'Environmental'],
    statistics: { peopleHelped: 12500, projectsCompleted: 30, donationsReceived: 680000, volunteersEngaged: 105 },
    rating: { average: 4.5, count: 72 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' }
  },
  d18: {
    _id: 'd18', name: 'Chengalpattu Urban Slum Development', ngoType: 'Service',
    description: 'Transforming urban slums in Chengalpattu through housing improvement, sanitation, education, and healthcare. We have upgraded 200 slum homes, established 5 community learning centres, and run daily health clinics serving 500+ slum residents.',
    registrationNumber: 'TN-CGL-031-2011', email: 'chengalpattu.usd@org.in', phone: '044-27234585',
    website: '', foundedYear: 2011, teamSize: 40, isVerified: true, isActive: true,
    location: { address: '22, GST Road', city: 'Chengalpattu', state: 'Tamil Nadu', country: 'India', pincode: '603001', coordinates: [79.9864, 12.6919] },
    serviceCategories: ['Shelter', 'Education', 'Healthcare'],
    statistics: { peopleHelped: 15000, projectsCompleted: 38, donationsReceived: 1200000, volunteersEngaged: 160 },
    rating: { average: 4.6, count: 95 },
    socialMedia: { facebook: 'https://facebook.com', linkedin: 'https://linkedin.com' }
  },
  d19: {
    _id: 'd19', name: 'Ramanathapuram Fishermen Welfare Trust', ngoType: 'Community-based',
    description: 'Supporting fishing communities in Ramanathapuram with disaster relief, boat repair assistance, children education, and healthcare camps. We have provided boat repair assistance to 1,000+ fishermen and run 3 schools for fisher children with 100% attendance.',
    registrationNumber: 'TN-RMD-016-2006', email: 'rmdfishermen@welfare.org', phone: '04567-234570',
    website: '', foundedYear: 2006, teamSize: 40, isVerified: true, isActive: true,
    location: { address: '5, Harbour Road', city: 'Ramanathapuram', state: 'Tamil Nadu', country: 'India', pincode: '623501', coordinates: [78.8305, 9.3639] },
    serviceCategories: ['Disaster Relief', 'Healthcare', 'Child Welfare'],
    statistics: { peopleHelped: 16000, projectsCompleted: 44, donationsReceived: 1400000, volunteersEngaged: 160 },
    rating: { average: 4.6, count: 90 },
    socialMedia: { facebook: 'https://facebook.com', twitter: 'https://twitter.com' }
  },
  d20: {
    _id: 'd20', name: 'Thoothukudi Port Community Foundation', ngoType: 'Community-based',
    description: 'Improving livelihoods of port workers and coastal communities in Thoothukudi through skill training, education, and environmental conservation. We have trained 2,000 youth in port-related skills, planted 10,000 mangrove trees, and run 5 community schools.',
    registrationNumber: 'TN-TUT-019-2010', email: 'thoothukudi.pcf@foundation.org', phone: '0461-2234573',
    website: '', foundedYear: 2010, teamSize: 45, isVerified: true, isActive: true,
    location: { address: '67, Harbour Estate', city: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', pincode: '628001', coordinates: [78.1348, 8.7642] },
    serviceCategories: ['Skill Development', 'Environmental', 'Education'],
    statistics: { peopleHelped: 13000, projectsCompleted: 36, donationsReceived: 1050000, volunteersEngaged: 175 },
    rating: { average: 4.4, count: 78 },
    socialMedia: { instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' }
  },
};

function getDummyNGO(id) {
  // Return exact match for dummy IDs (d1-d20)
  if (DUMMY_NGO_DB[id]) return DUMMY_NGO_DB[id];
  // Default fallback for unknown IDs
  return DUMMY_NGO_DB['d1'];
}

export default NGODetail;

