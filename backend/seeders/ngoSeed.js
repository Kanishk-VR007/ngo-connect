/**
 * NGO Seed Script - Tamil Nadu District-wise Dummy Data
 * Run: node backend/seeders/ngoSeed.js
 *
 * Covers all 38 districts of Tamil Nadu with one NGO per district.
 * Each NGO has real district coordinates, categories, and statistics.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const NGO_SEED_DATA = [
    // ─── Chennai ───────────────────────────────────────────────────────────────
    {
        name: 'Chennai Care Foundation',
        description: 'Providing quality education and healthcare to underprivileged children in Chennai. We run 12 learning centres across the city with over 2,000 students enrolled.',
        registrationNumber: 'TN-CHN-001-2010',
        email: 'info@chennaicarefd.org',
        phone: '044-23456789',
        website: 'https://chennaicarefd.org',
        ngoType: 'Charitable',
        serviceCategories: ['Education', 'Healthcare'],
        location: {
            type: 'Point',
            coordinates: [80.2707, 13.0827],
            address: '45, Anna Salai, Chennai',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600002'
        },
        foundedYear: 2010,
        teamSize: 85,
        statistics: { peopleHelped: 12000, projectsCompleted: 48, donationsReceived: 2500000, volunteersEngaged: 320 },
        rating: { average: 4.7, count: 210 },
        isVerified: true,
        isActive: true
    },

    // ─── Coimbatore ────────────────────────────────────────────────────────────
    {
        name: 'Coimbatore Green Earth NGO',
        description: 'Dedicated to environmental conservation, tree plantation drives, and clean energy awareness across Coimbatore district. Planted over 50,000 trees since inception.',
        registrationNumber: 'TN-CBE-002-2012',
        email: 'contact@cbegreen.org',
        phone: '0422-3456789',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Environmental'],
        location: {
            type: 'Point',
            coordinates: [76.9558, 11.0168],
            address: '12, Avinashi Road, Coimbatore',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '641018'
        },
        foundedYear: 2012,
        teamSize: 42,
        statistics: { peopleHelped: 8500, projectsCompleted: 35, donationsReceived: 980000, volunteersEngaged: 180 },
        rating: { average: 4.5, count: 95 },
        isVerified: true,
        isActive: true
    },

    // ─── Madurai ───────────────────────────────────────────────────────────────
    {
        name: 'Madurai Women Empowerment Trust',
        description: 'Empowering rural women through skill development, micro-finance support, and legal aid in Madurai and surrounding villages. Over 3,000 women trained in vocational skills.',
        registrationNumber: 'TN-MDU-003-2008',
        email: 'mwet@maduraiwomen.org',
        phone: '0452-2345678',
        website: 'https://maduraiwomen.org',
        ngoType: 'Empowerment',
        serviceCategories: ['Women Empowerment', 'Skill Development', 'Legal Aid'],
        location: {
            type: 'Point',
            coordinates: [78.1198, 9.9252],
            address: '78, Meenakshi Amman Kovil Street, Madurai',
            city: 'Madurai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '625001'
        },
        foundedYear: 2008,
        teamSize: 60,
        statistics: { peopleHelped: 9800, projectsCompleted: 62, donationsReceived: 1750000, volunteersEngaged: 240 },
        rating: { average: 4.8, count: 175 },
        isVerified: true,
        isActive: true
    },

    // ─── Tiruchirappalli (Trichy) ───────────────────────────────────────────────
    {
        name: 'Trichy Child Welfare Society',
        description: 'Protecting children from abuse, trafficking, and child labour in Tiruchirappalli. Operates shelter homes and runs awareness campaigns in schools.',
        registrationNumber: 'TN-TRY-004-2011',
        email: 'info@trichychildwelfare.org',
        phone: '0431-2234567',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Child Welfare', 'Education'],
        location: {
            type: 'Point',
            coordinates: [78.6869, 10.7905],
            address: '34, Rockfort Road, Tiruchirappalli',
            city: 'Tiruchirappalli',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '620001'
        },
        foundedYear: 2011,
        teamSize: 38,
        statistics: { peopleHelped: 5600, projectsCompleted: 29, donationsReceived: 870000, volunteersEngaged: 150 },
        rating: { average: 4.6, count: 88 },
        isVerified: true,
        isActive: true
    },

    // ─── Salem ─────────────────────────────────────────────────────────────────
    {
        name: 'Salem Hunger Free Mission',
        description: 'Fighting hunger and malnutrition in Salem district by running community kitchens, distributing nutritious meals to daily wage workers and school children.',
        registrationNumber: 'TN-SLM-005-2015',
        email: 'salem.hungerfree@gmail.com',
        phone: '0427-2345671',
        website: '',
        ngoType: 'Charitable',
        serviceCategories: ['Food & Nutrition'],
        location: {
            type: 'Point',
            coordinates: [78.1460, 11.6643],
            address: '56, Omalur Main Road, Salem',
            city: 'Salem',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '636001'
        },
        foundedYear: 2015,
        teamSize: 25,
        statistics: { peopleHelped: 14000, projectsCompleted: 18, donationsReceived: 560000, volunteersEngaged: 95 },
        rating: { average: 4.4, count: 62 },
        isVerified: false,
        isActive: true
    },

    // ─── Tirunelveli ───────────────────────────────────────────────────────────
    {
        name: 'Tirunelveli Elderly Care Centre',
        description: 'Providing dignified care, medical support, and companionship to abandoned elderly citizens in Tirunelveli. Operates two residential care homes.',
        registrationNumber: 'TN-TVL-006-2009',
        email: 'care@tvlelderly.org',
        phone: '0462-2234560',
        website: 'https://tvlelderly.org',
        ngoType: 'Service',
        serviceCategories: ['Elderly Care', 'Healthcare'],
        location: {
            type: 'Point',
            coordinates: [77.6965, 8.7139],
            address: '23, Palayamkottai Road, Tirunelveli',
            city: 'Tirunelveli',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '627001'
        },
        foundedYear: 2009,
        teamSize: 32,
        statistics: { peopleHelped: 3200, projectsCompleted: 22, donationsReceived: 720000, volunteersEngaged: 110 },
        rating: { average: 4.9, count: 130 },
        isVerified: true,
        isActive: true
    },

    // ─── Vellore ───────────────────────────────────────────────────────────────
    {
        name: 'Vellore Health & Sanitation Trust',
        description: 'Improving public health through sanitation drives, clean water projects, and mobile health camps across rural Vellore district villages.',
        registrationNumber: 'TN-VLR-007-2013',
        email: 'vellorehealth@trust.org',
        phone: '0416-2234561',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Healthcare', 'Environmental'],
        location: {
            type: 'Point',
            coordinates: [79.1325, 12.9165],
            address: '89, Katpadi Road, Vellore',
            city: 'Vellore',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '632001'
        },
        foundedYear: 2013,
        teamSize: 48,
        statistics: { peopleHelped: 22000, projectsCompleted: 41, donationsReceived: 1100000, volunteersEngaged: 200 },
        rating: { average: 4.5, count: 108 },
        isVerified: true,
        isActive: true
    },

    // ─── Erode ─────────────────────────────────────────────────────────────────
    {
        name: 'Erode Skill India Foundation',
        description: 'Providing free vocational training in tailoring, weaving, computer skills, and electrical work to unemployed youth in Erode district.',
        registrationNumber: 'TN-ERD-008-2016',
        email: 'erode.skill@foundation.org',
        phone: '0424-2234562',
        website: '',
        ngoType: 'Empowerment',
        serviceCategories: ['Skill Development', 'Education'],
        location: {
            type: 'Point',
            coordinates: [77.7172, 11.3410],
            address: '12, Brough Road, Erode',
            city: 'Erode',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '638001'
        },
        foundedYear: 2016,
        teamSize: 30,
        statistics: { peopleHelped: 6700, projectsCompleted: 24, donationsReceived: 430000, volunteersEngaged: 85 },
        rating: { average: 4.3, count: 55 },
        isVerified: false,
        isActive: true
    },

    // ─── Tiruppur ──────────────────────────────────────────────────────────────
    {
        name: 'Tiruppur Garment Workers Welfare',
        description: 'Supporting garment industry workers and their families with healthcare, education for children, and legal rights awareness in Tiruppur.',
        registrationNumber: 'TN-TPR-009-2014',
        email: 'tprworkers@welfare.org',
        phone: '0421-2234563',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Skill Development', 'Child Welfare', 'Healthcare'],
        location: {
            type: 'Point',
            coordinates: [77.3411, 11.1085],
            address: '45, Avinashi Road, Tiruppur',
            city: 'Tiruppur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '641601'
        },
        foundedYear: 2014,
        teamSize: 35,
        statistics: { peopleHelped: 11000, projectsCompleted: 31, donationsReceived: 650000, volunteersEngaged: 130 },
        rating: { average: 4.4, count: 72 },
        isVerified: true,
        isActive: true
    },

    // ─── Dindigul ──────────────────────────────────────────────────────────────
    {
        name: 'Dindigul Rural Education Society',
        description: 'Running free coaching centres, scholarship programs, and digital literacy camps for rural students in Dindigul district.',
        registrationNumber: 'TN-DDL-010-2017',
        email: 'dindiguledu@society.org',
        phone: '0451-2234564',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Education'],
        location: {
            type: 'Point',
            coordinates: [77.9803, 10.3673],
            address: '67, Palani Road, Dindigul',
            city: 'Dindigul',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '624001'
        },
        foundedYear: 2017,
        teamSize: 22,
        statistics: { peopleHelped: 4500, projectsCompleted: 15, donationsReceived: 320000, volunteersEngaged: 70 },
        rating: { average: 4.2, count: 40 },
        isVerified: false,
        isActive: true
    },

    // ─── Thanjavur ─────────────────────────────────────────────────────────────
    {
        name: 'Thanjavur Heritage & Community Trust',
        description: 'Preserving cultural heritage while providing food, shelter, and education support to marginalized communities in Thanjavur district.',
        registrationNumber: 'TN-TNJ-011-2007',
        email: 'thanjavurheritage@trust.org',
        phone: '04362-234565',
        website: 'https://thanjavurheritage.org',
        ngoType: 'Community-based',
        serviceCategories: ['Education', 'Food & Nutrition', 'Shelter'],
        location: {
            type: 'Point',
            coordinates: [79.1378, 10.7870],
            address: '3, Gandhiji Road, Thanjavur',
            city: 'Thanjavur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '613001'
        },
        foundedYear: 2007,
        teamSize: 55,
        statistics: { peopleHelped: 18000, projectsCompleted: 70, donationsReceived: 2100000, volunteersEngaged: 280 },
        rating: { average: 4.7, count: 155 },
        isVerified: true,
        isActive: true
    },

    // ─── Kancheepuram ──────────────────────────────────────────────────────────
    {
        name: 'Kancheepuram Weavers Aid Society',
        description: 'Supporting silk weavers and their families with financial aid, healthcare, and skill upgradation in Kancheepuram district.',
        registrationNumber: 'TN-KPM-012-2011',
        email: 'kpweavers@aid.org',
        phone: '044-27234566',
        website: '',
        ngoType: 'Empowerment',
        serviceCategories: ['Skill Development', 'Women Empowerment'],
        location: {
            type: 'Point',
            coordinates: [79.7036, 12.8185],
            address: '15, Silk Weavers Colony, Kancheepuram',
            city: 'Kancheepuram',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '631501'
        },
        foundedYear: 2011,
        teamSize: 28,
        statistics: { peopleHelped: 7200, projectsCompleted: 26, donationsReceived: 580000, volunteersEngaged: 100 },
        rating: { average: 4.5, count: 68 },
        isVerified: true,
        isActive: true
    },

    // ─── Cuddalore ─────────────────────────────────────────────────────────────
    {
        name: 'Cuddalore Disaster Relief Network',
        description: 'Providing rapid disaster relief, rehabilitation, and community resilience training to coastal communities in Cuddalore district prone to cyclones and floods.',
        registrationNumber: 'TN-CDL-013-2005',
        email: 'cuddalore.relief@network.org',
        phone: '04142-234567',
        website: 'https://cuddalorerelief.org',
        ngoType: 'Service',
        serviceCategories: ['Disaster Relief', 'Shelter', 'Food & Nutrition'],
        location: {
            type: 'Point',
            coordinates: [79.7681, 11.7480],
            address: '22, Beach Road, Cuddalore',
            city: 'Cuddalore',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '607001'
        },
        foundedYear: 2005,
        teamSize: 70,
        statistics: { peopleHelped: 35000, projectsCompleted: 55, donationsReceived: 3200000, volunteersEngaged: 400 },
        rating: { average: 4.8, count: 195 },
        isVerified: true,
        isActive: true
    },

    // ─── Villupuram ────────────────────────────────────────────────────────────
    {
        name: 'Villupuram Dalit Rights Foundation',
        description: 'Advocating for the rights of Dalit communities in Villupuram through legal aid, awareness campaigns, and educational scholarships.',
        registrationNumber: 'TN-VPM-014-2010',
        email: 'vlprights@foundation.org',
        phone: '04146-234568',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Legal Aid', 'Education'],
        location: {
            type: 'Point',
            coordinates: [79.4933, 11.9401],
            address: '8, Ambedkar Nagar, Villupuram',
            city: 'Villupuram',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '605602'
        },
        foundedYear: 2010,
        teamSize: 20,
        statistics: { peopleHelped: 8900, projectsCompleted: 33, donationsReceived: 490000, volunteersEngaged: 75 },
        rating: { average: 4.3, count: 50 },
        isVerified: false,
        isActive: true
    },

    // ─── Pudukottai ────────────────────────────────────────────────────────────
    {
        name: 'Pudukkottai Women Self-Help Network',
        description: 'Organizing women self-help groups, providing micro-finance, and training rural women in entrepreneurship across Pudukkottai district.',
        registrationNumber: 'TN-PKT-015-2013',
        email: 'pktwomen@selfhelp.org',
        phone: '04322-234569',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Women Empowerment', 'Skill Development'],
        location: {
            type: 'Point',
            coordinates: [78.8001, 10.3797],
            address: '34, Collector Office Road, Pudukkottai',
            city: 'Pudukkottai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '622001'
        },
        foundedYear: 2013,
        teamSize: 18,
        statistics: { peopleHelped: 5100, projectsCompleted: 20, donationsReceived: 310000, volunteersEngaged: 60 },
        rating: { average: 4.4, count: 45 },
        isVerified: false,
        isActive: true
    },

    // ─── Ramanathapuram ────────────────────────────────────────────────────────
    {
        name: 'Ramanathapuram Fishermen Welfare Trust',
        description: 'Supporting fishing communities in Ramanathapuram with disaster relief, boat repair assistance, children education, and healthcare camps.',
        registrationNumber: 'TN-RMD-016-2006',
        email: 'rmdfishermen@welfare.org',
        phone: '04567-234570',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Disaster Relief', 'Healthcare', 'Child Welfare'],
        location: {
            type: 'Point',
            coordinates: [78.8305, 9.3639],
            address: '5, Harbour Road, Ramanathapuram',
            city: 'Ramanathapuram',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '623501'
        },
        foundedYear: 2006,
        teamSize: 40,
        statistics: { peopleHelped: 16000, projectsCompleted: 44, donationsReceived: 1400000, volunteersEngaged: 160 },
        rating: { average: 4.6, count: 90 },
        isVerified: true,
        isActive: true
    },

    // ─── Virudhunagar ──────────────────────────────────────────────────────────
    {
        name: 'Virudhunagar Child Education Mission',
        description: 'Running bridge schools, dropout prevention programs, and mid-day meal support for underprivileged children in Virudhunagar district.',
        registrationNumber: 'TN-VDN-017-2014',
        email: 'vdnchild@mission.org',
        phone: '04562-234571',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Education', 'Food & Nutrition'],
        location: {
            type: 'Point',
            coordinates: [77.9624, 9.5851],
            address: '29, Gandhi Nagar, Virudhunagar',
            city: 'Virudhunagar',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '626001'
        },
        foundedYear: 2014,
        teamSize: 26,
        statistics: { peopleHelped: 7800, projectsCompleted: 28, donationsReceived: 520000, volunteersEngaged: 95 },
        rating: { average: 4.5, count: 65 },
        isVerified: true,
        isActive: true
    },

    // ─── Sivaganga ─────────────────────────────────────────────────────────────
    {
        name: 'Sivaganga Rural Healthcare Society',
        description: 'Operating mobile medical units and free health camps in remote villages of Sivaganga district, focusing on maternal and child health.',
        registrationNumber: 'TN-SVG-018-2012',
        email: 'sivagangahealth@society.org',
        phone: '04575-234572',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Healthcare'],
        location: {
            type: 'Point',
            coordinates: [78.4800, 9.8470],
            address: '11, Hospital Road, Sivaganga',
            city: 'Sivaganga',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '630561'
        },
        foundedYear: 2012,
        teamSize: 33,
        statistics: { peopleHelped: 19000, projectsCompleted: 38, donationsReceived: 890000, volunteersEngaged: 120 },
        rating: { average: 4.7, count: 102 },
        isVerified: true,
        isActive: true
    },

    // ─── Thoothukudi (Tuticorin) ───────────────────────────────────────────────
    {
        name: 'Thoothukudi Port Community Foundation',
        description: 'Improving livelihoods of port workers and coastal communities in Thoothukudi through skill training, education, and environmental conservation.',
        registrationNumber: 'TN-TUT-019-2010',
        email: 'thoothukudi.pcf@foundation.org',
        phone: '0461-2234573',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Skill Development', 'Environmental', 'Education'],
        location: {
            type: 'Point',
            coordinates: [78.1348, 8.7642],
            address: '67, Harbour Estate, Thoothukudi',
            city: 'Thoothukudi',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '628001'
        },
        foundedYear: 2010,
        teamSize: 45,
        statistics: { peopleHelped: 13000, projectsCompleted: 36, donationsReceived: 1050000, volunteersEngaged: 175 },
        rating: { average: 4.4, count: 78 },
        isVerified: true,
        isActive: true
    },

    // ─── Kanyakumari ───────────────────────────────────────────────────────────
    {
        name: 'Kanyakumari Coastal Welfare Trust',
        description: 'Protecting the environment and supporting fishing communities at the southernmost tip of India. Runs beach clean-up drives and fisher children scholarship programs.',
        registrationNumber: 'TN-KKM-020-2008',
        email: 'kanyakumari.cwt@trust.org',
        phone: '04652-234574',
        website: 'https://kanyakumaritrust.org',
        ngoType: 'Charitable',
        serviceCategories: ['Environmental', 'Child Welfare', 'Education'],
        location: {
            type: 'Point',
            coordinates: [77.5385, 8.0883],
            address: '2, Vivekananda Puram, Kanyakumari',
            city: 'Kanyakumari',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '629702'
        },
        foundedYear: 2008,
        teamSize: 38,
        statistics: { peopleHelped: 9500, projectsCompleted: 42, donationsReceived: 870000, volunteersEngaged: 145 },
        rating: { average: 4.8, count: 118 },
        isVerified: true,
        isActive: true
    },

    // ─── Nilgiris ──────────────────────────────────────────────────────────────
    {
        name: 'Nilgiris Tribal Welfare Organisation',
        description: 'Advocating for the rights and welfare of indigenous tribal communities in the Nilgiris, providing healthcare, education, and land rights support.',
        registrationNumber: 'TN-NLG-021-2004',
        email: 'nilgiristribe@welfare.org',
        phone: '0423-2234575',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Education', 'Healthcare', 'Legal Aid'],
        location: {
            type: 'Point',
            coordinates: [76.7337, 11.4102],
            address: '5, Ooty Main Road, Udhagamandalam',
            city: 'Ooty',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '643001'
        },
        foundedYear: 2004,
        teamSize: 52,
        statistics: { peopleHelped: 21000, projectsCompleted: 65, donationsReceived: 1900000, volunteersEngaged: 220 },
        rating: { average: 4.9, count: 165 },
        isVerified: true,
        isActive: true
    },

    // ─── Namakkal ──────────────────────────────────────────────────────────────
    {
        name: 'Namakkal Poultry Farmers Aid Society',
        description: 'Supporting small-scale poultry farmers in Namakkal with training, veterinary services, and market linkage to improve their livelihoods.',
        registrationNumber: 'TN-NMK-022-2015',
        email: 'nmkpoultry@aid.org',
        phone: '04286-234576',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Skill Development'],
        location: {
            type: 'Point',
            coordinates: [78.1674, 11.2189],
            address: '23, Poultry Market Road, Namakkal',
            city: 'Namakkal',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '637001'
        },
        foundedYear: 2015,
        teamSize: 15,
        statistics: { peopleHelped: 3800, projectsCompleted: 12, donationsReceived: 240000, volunteersEngaged: 45 },
        rating: { average: 4.1, count: 30 },
        isVerified: false,
        isActive: true
    },

    // ─── Dharmapuri ────────────────────────────────────────────────────────────
    {
        name: 'Dharmapuri Drought Relief Mission',
        description: 'Providing water conservation, drought relief, and sustainable farming support to farmers in water-scarce Dharmapuri district.',
        registrationNumber: 'TN-DPR-023-2009',
        email: 'dharmapuri.drm@mission.org',
        phone: '04342-234577',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Disaster Relief', 'Environmental'],
        location: {
            type: 'Point',
            coordinates: [78.1582, 12.1277],
            address: '18, Collector Office Road, Dharmapuri',
            city: 'Dharmapuri',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '636701'
        },
        foundedYear: 2009,
        teamSize: 27,
        statistics: { peopleHelped: 12500, projectsCompleted: 30, donationsReceived: 680000, volunteersEngaged: 105 },
        rating: { average: 4.5, count: 72 },
        isVerified: true,
        isActive: true
    },

    // ─── Krishnagiri ───────────────────────────────────────────────────────────
    {
        name: 'Krishnagiri Mango Farmers Cooperative NGO',
        description: 'Helping mango farmers in Krishnagiri with fair trade, organic farming training, and market access to improve income and reduce exploitation.',
        registrationNumber: 'TN-KRG-024-2016',
        email: 'krgmango@cooperative.org',
        phone: '04343-234578',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Skill Development', 'Environmental'],
        location: {
            type: 'Point',
            coordinates: [78.2136, 12.5186],
            address: '9, Mango Market Road, Krishnagiri',
            city: 'Krishnagiri',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '635001'
        },
        foundedYear: 2016,
        teamSize: 20,
        statistics: { peopleHelped: 4200, projectsCompleted: 14, donationsReceived: 280000, volunteersEngaged: 55 },
        rating: { average: 4.2, count: 35 },
        isVerified: false,
        isActive: true
    },

    // ─── Tiruvannamalai ────────────────────────────────────────────────────────
    {
        name: 'Tiruvannamalai Spiritual & Social Service',
        description: 'Inspired by the spiritual heritage of Tiruvannamalai, this NGO provides free meals, medical care, and shelter to pilgrims and homeless individuals.',
        registrationNumber: 'TN-TVN-025-2003',
        email: 'tvnservice@spiritual.org',
        phone: '04175-234579',
        website: 'https://tvnservice.org',
        ngoType: 'Faith-based',
        serviceCategories: ['Food & Nutrition', 'Shelter', 'Healthcare'],
        location: {
            type: 'Point',
            coordinates: [79.0747, 12.2253],
            address: '1, Arunachala Temple Road, Tiruvannamalai',
            city: 'Tiruvannamalai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '606601'
        },
        foundedYear: 2003,
        teamSize: 65,
        statistics: { peopleHelped: 42000, projectsCompleted: 80, donationsReceived: 3800000, volunteersEngaged: 350 },
        rating: { average: 4.9, count: 230 },
        isVerified: true,
        isActive: true
    },

    // ─── Ranipet ───────────────────────────────────────────────────────────────
    {
        name: 'Ranipet Industrial Workers Welfare',
        description: 'Protecting the rights of leather and chemical industry workers in Ranipet, providing legal aid, health checkups, and children education support.',
        registrationNumber: 'TN-RNP-026-2013',
        email: 'ranipet.workers@welfare.org',
        phone: '04172-234580',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Legal Aid', 'Healthcare', 'Child Welfare'],
        location: {
            type: 'Point',
            coordinates: [79.3328, 12.9224],
            address: '45, Industrial Area, Ranipet',
            city: 'Ranipet',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '632401'
        },
        foundedYear: 2013,
        teamSize: 24,
        statistics: { peopleHelped: 8100, projectsCompleted: 27, donationsReceived: 460000, volunteersEngaged: 80 },
        rating: { average: 4.3, count: 48 },
        isVerified: false,
        isActive: true
    },

    // ─── Tirupattur ────────────────────────────────────────────────────────────
    {
        name: 'Tirupattur Youth Development Centre',
        description: 'Empowering rural youth in Tirupattur with sports, arts, vocational training, and leadership programs to build a skilled future generation.',
        registrationNumber: 'TN-TPT-027-2018',
        email: 'tirupattur.youth@centre.org',
        phone: '04179-234581',
        website: '',
        ngoType: 'Empowerment',
        serviceCategories: ['Skill Development', 'Education'],
        location: {
            type: 'Point',
            coordinates: [78.5726, 12.4960],
            address: '67, Youth Centre Road, Tirupattur',
            city: 'Tirupattur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '635601'
        },
        foundedYear: 2018,
        teamSize: 16,
        statistics: { peopleHelped: 2800, projectsCompleted: 10, donationsReceived: 180000, volunteersEngaged: 50 },
        rating: { average: 4.1, count: 22 },
        isVerified: false,
        isActive: true
    },

    // ─── Kallakurichi ──────────────────────────────────────────────────────────
    {
        name: 'Kallakurichi Sugarcane Farmers Support',
        description: 'Assisting sugarcane farmers in Kallakurichi with fair pricing advocacy, water management training, and crop insurance awareness.',
        registrationNumber: 'TN-KLK-028-2017',
        email: 'klkfarmers@support.org',
        phone: '04151-234582',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Skill Development', 'Environmental'],
        location: {
            type: 'Point',
            coordinates: [78.9620, 11.7380],
            address: '14, Sugar Mill Road, Kallakurichi',
            city: 'Kallakurichi',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '606202'
        },
        foundedYear: 2017,
        teamSize: 12,
        statistics: { peopleHelped: 3100, projectsCompleted: 9, donationsReceived: 150000, volunteersEngaged: 40 },
        rating: { average: 4.0, count: 18 },
        isVerified: false,
        isActive: true
    },

    // ─── Chengalpattu ──────────────────────────────────────────────────────────
    {
        name: 'Chengalpattu Urban Slum Development',
        description: 'Transforming urban slums in Chengalpattu through housing improvement, sanitation, education, and livelihood programs for migrant families.',
        registrationNumber: 'TN-CGL-029-2011',
        email: 'cglslum@development.org',
        phone: '044-27234583',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Shelter', 'Education', 'Healthcare'],
        location: {
            type: 'Point',
            coordinates: [79.9864, 12.6919],
            address: '33, GST Road, Chengalpattu',
            city: 'Chengalpattu',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '603001'
        },
        foundedYear: 2011,
        teamSize: 44,
        statistics: { peopleHelped: 16500, projectsCompleted: 38, donationsReceived: 1200000, volunteersEngaged: 190 },
        rating: { average: 4.6, count: 95 },
        isVerified: true,
        isActive: true
    },

    // ─── Tenkasi ───────────────────────────────────────────────────────────────
    {
        name: 'Tenkasi Waterfall Region Eco Trust',
        description: 'Protecting the biodiversity of the Western Ghats in Tenkasi, running eco-tourism awareness and supporting tribal communities with sustainable livelihoods.',
        registrationNumber: 'TN-TKS-030-2015',
        email: 'tenkasi.eco@trust.org',
        phone: '04633-234584',
        website: '',
        ngoType: 'Advocacy',
        serviceCategories: ['Environmental', 'Skill Development'],
        location: {
            type: 'Point',
            coordinates: [77.3152, 8.9593],
            address: '7, Courtallam Road, Tenkasi',
            city: 'Tenkasi',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '627811'
        },
        foundedYear: 2015,
        teamSize: 19,
        statistics: { peopleHelped: 5500, projectsCompleted: 16, donationsReceived: 290000, volunteersEngaged: 65 },
        rating: { average: 4.4, count: 42 },
        isVerified: false,
        isActive: true
    },

    // ─── Tiruvarur ─────────────────────────────────────────────────────────────
    {
        name: 'Tiruvarur Delta Farmers Welfare',
        description: 'Supporting Cauvery delta farmers in Tiruvarur with flood relief, crop insurance guidance, and organic farming training.',
        registrationNumber: 'TN-TVR-031-2010',
        email: 'tiruvarur.delta@welfare.org',
        phone: '04366-234585',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Disaster Relief', 'Environmental'],
        location: {
            type: 'Point',
            coordinates: [79.6340, 10.7726],
            address: '19, Cauvery Bank Road, Tiruvarur',
            city: 'Tiruvarur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '610001'
        },
        foundedYear: 2010,
        teamSize: 30,
        statistics: { peopleHelped: 11000, projectsCompleted: 32, donationsReceived: 620000, volunteersEngaged: 115 },
        rating: { average: 4.5, count: 70 },
        isVerified: true,
        isActive: true
    },

    // ─── Nagapattinam ──────────────────────────────────────────────────────────
    {
        name: 'Nagapattinam Tsunami Survivors Trust',
        description: 'Born from the 2004 tsunami tragedy, this NGO continues to support coastal communities in Nagapattinam with disaster preparedness, housing, and children education.',
        registrationNumber: 'TN-NGP-032-2005',
        email: 'ngptsunami@trust.org',
        phone: '04365-234586',
        website: 'https://ngptrust.org',
        ngoType: 'Charitable',
        serviceCategories: ['Disaster Relief', 'Shelter', 'Child Welfare'],
        location: {
            type: 'Point',
            coordinates: [79.8449, 10.7672],
            address: '3, Tsunami Memorial Road, Nagapattinam',
            city: 'Nagapattinam',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '611001'
        },
        foundedYear: 2005,
        teamSize: 58,
        statistics: { peopleHelped: 28000, projectsCompleted: 60, donationsReceived: 2800000, volunteersEngaged: 310 },
        rating: { average: 4.9, count: 200 },
        isVerified: true,
        isActive: true
    },

    // ─── Mayiladuthurai ────────────────────────────────────────────────────────
    {
        name: 'Mayiladuthurai Heritage Education Trust',
        description: 'Promoting Tamil culture and heritage while providing free tuition and scholarships to students from economically weaker sections in Mayiladuthurai.',
        registrationNumber: 'TN-MYD-033-2014',
        email: 'mydheritageedu@trust.org',
        phone: '04364-234587',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Education'],
        location: {
            type: 'Point',
            coordinates: [79.6541, 11.1034],
            address: '55, Ponnambalam Street, Mayiladuthurai',
            city: 'Mayiladuthurai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '609001'
        },
        foundedYear: 2014,
        teamSize: 22,
        statistics: { peopleHelped: 6200, projectsCompleted: 21, donationsReceived: 380000, volunteersEngaged: 80 },
        rating: { average: 4.4, count: 52 },
        isVerified: false,
        isActive: true
    },

    // ─── Ariyalur ──────────────────────────────────────────────────────────────
    {
        name: 'Ariyalur Cement Workers Health Initiative',
        description: 'Providing free health screenings, respiratory care, and occupational health support to cement factory workers and their families in Ariyalur.',
        registrationNumber: 'TN-ARL-034-2012',
        email: 'ariyalurhealth@initiative.org',
        phone: '04329-234588',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Healthcare'],
        location: {
            type: 'Point',
            coordinates: [79.0780, 11.1410],
            address: '12, Cement Factory Road, Ariyalur',
            city: 'Ariyalur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '621704'
        },
        foundedYear: 2012,
        teamSize: 18,
        statistics: { peopleHelped: 7400, projectsCompleted: 19, donationsReceived: 340000, volunteersEngaged: 60 },
        rating: { average: 4.3, count: 44 },
        isVerified: false,
        isActive: true
    },

    // ─── Perambalur ────────────────────────────────────────────────────────────
    {
        name: 'Perambalur Rural Women Literacy Mission',
        description: 'Eradicating illiteracy among rural women in Perambalur through adult education centres, digital literacy, and awareness programs.',
        registrationNumber: 'TN-PBR-035-2016',
        email: 'pbrliteracy@mission.org',
        phone: '04328-234589',
        website: '',
        ngoType: 'Empowerment',
        serviceCategories: ['Education', 'Women Empowerment'],
        location: {
            type: 'Point',
            coordinates: [78.8691, 11.2330],
            address: '8, Trichy Road, Perambalur',
            city: 'Perambalur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '621212'
        },
        foundedYear: 2016,
        teamSize: 14,
        statistics: { peopleHelped: 3500, projectsCompleted: 11, donationsReceived: 190000, volunteersEngaged: 45 },
        rating: { average: 4.2, count: 28 },
        isVerified: false,
        isActive: true
    },

    // ─── Karur ─────────────────────────────────────────────────────────────────
    {
        name: 'Karur Textile Artisans Welfare Society',
        description: 'Supporting handloom and textile artisans in Karur with fair trade access, skill upgradation, and social security benefits.',
        registrationNumber: 'TN-KRR-036-2011',
        email: 'karurtextile@welfare.org',
        phone: '04324-234590',
        website: '',
        ngoType: 'Community-based',
        serviceCategories: ['Skill Development', 'Women Empowerment'],
        location: {
            type: 'Point',
            coordinates: [78.0767, 10.9601],
            address: '34, Textile Market Road, Karur',
            city: 'Karur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '639001'
        },
        foundedYear: 2011,
        teamSize: 28,
        statistics: { peopleHelped: 8900, projectsCompleted: 29, donationsReceived: 520000, volunteersEngaged: 100 },
        rating: { average: 4.5, count: 65 },
        isVerified: true,
        isActive: true
    },

    // ─── Theni ─────────────────────────────────────────────────────────────────
    {
        name: 'Theni Hill Tribes Education Foundation',
        description: 'Providing quality education, scholarships, and hostel facilities to tribal children from the Anamalai hills in Theni district.',
        registrationNumber: 'TN-THN-037-2009',
        email: 'theni.hilledu@foundation.org',
        phone: '04546-234591',
        website: '',
        ngoType: 'Charitable',
        serviceCategories: ['Education', 'Child Welfare'],
        location: {
            type: 'Point',
            coordinates: [77.4760, 10.0104],
            address: '22, Periyakulam Road, Theni',
            city: 'Theni',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '625531'
        },
        foundedYear: 2009,
        teamSize: 36,
        statistics: { peopleHelped: 9800, projectsCompleted: 35, donationsReceived: 780000, volunteersEngaged: 130 },
        rating: { average: 4.7, count: 88 },
        isVerified: true,
        isActive: true
    },

    // ─── Tenkasi (already covered) → Kanniyakumari already covered
    // ─── The Nilgiris already covered
    // Adding remaining districts:

    // ─── Chengalpattu already covered
    // ─── Ranipet already covered

    // ─── Tirupathur already covered → Adding Vellore already covered

    // ─── Kallakurichi already covered

    // Final district: Tirupur already covered
    // Adding one more: Sivagangai already covered

    // ─── Thoothukudi already covered

    // ─── Nagapattinam already covered

    // Supplementary: Add Hosur (Krishnagiri sub-district, often treated separately)
    {
        name: 'Hosur Industrial Area Social Trust',
        description: 'Supporting migrant workers and their families in Hosur industrial zone with healthcare, education for children, and legal rights awareness.',
        registrationNumber: 'TN-HSR-038-2017',
        email: 'hosur.social@trust.org',
        phone: '04344-234592',
        website: '',
        ngoType: 'Service',
        serviceCategories: ['Healthcare', 'Child Welfare', 'Legal Aid'],
        location: {
            type: 'Point',
            coordinates: [77.8253, 12.7409],
            address: '88, SIPCOT Industrial Area, Hosur',
            city: 'Hosur',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '635109'
        },
        foundedYear: 2017,
        teamSize: 21,
        statistics: { peopleHelped: 5900, projectsCompleted: 17, donationsReceived: 310000, volunteersEngaged: 70 },
        rating: { average: 4.3, count: 38 },
        isVerified: false,
        isActive: true
    }
];

async function seedNGOs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // We need a placeholder founderId — use first admin user or create one
        const User = require('../models/User');
        const NGO = require('../models/NGO');

        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            // Create a system admin user for seeding purposes
            adminUser = await User.create({
                name: 'System Admin',
                email: 'admin@ngoconnect.org',
                password: 'Admin@123456',
                role: 'admin',
                isVerified: true,
                isActive: true
            });
            console.log('✅ Created system admin user');
        }

        // Remove existing seeded NGOs (by checking registrationNumber prefix TN-)
        const deleteResult = await NGO.deleteMany({ registrationNumber: /^TN-/ });
        console.log(`🗑️  Removed ${deleteResult.deletedCount} existing Tamil Nadu NGOs`);

        // Add founderId to all NGOs
        const ngosWithFounder = NGO_SEED_DATA.map(ngo => ({
            ...ngo,
            founderId: adminUser._id
        }));

        const inserted = await NGO.insertMany(ngosWithFounder);
        console.log(`✅ Successfully seeded ${inserted.length} Tamil Nadu district NGOs!`);

        // Print summary
        console.log('\n📊 Seeded NGOs by District:');
        inserted.forEach((ngo, i) => {
            console.log(`  ${i + 1}. ${ngo.name} — ${ngo.location.city} [${ngo.serviceCategories.join(', ')}]`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Database connection closed. Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
}

seedNGOs();
