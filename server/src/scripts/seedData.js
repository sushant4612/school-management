const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Event = require('../models/Event')
const User = require('../models/User')

dotenv.config()

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking'
        await mongoose.connect(uri)
        console.log('✅ MongoDB connected')

        // Clear existing data
        await Event.deleteMany({})
        await User.deleteMany({})
        console.log('🗑️  Cleared existing data')

        // Create demo organizer
        const organizer = await User.create({
            name: 'Demo Organizer',
            email: 'organizer@demo.com',
            password: 'demo123456',
            role: 'organizer',
        })

        // Create demo user
        await User.create({
            name: 'Demo User',
            email: 'user@demo.com',
            password: 'demo123456',
            role: 'user',
            rewardPoints: 480,
        })

        // Create sample events
        const events = [
            {
                title: 'Synthwave Soirée',
                description: 'Immersive synthwave concert with neon visuals, live visuals, and retro gaming lounges.',
                category: 'music',
                location: { city: 'San Francisco', venue: 'Neon Arena', address: '123 Music St' },
                organizer: organizer._id,
                languagesSupported: ['en', 'es'],
                tags: ['live', 'nightlife', 'vip'],
                tierPricing: [
                    { name: 'General', price: 79, capacity: 120, sold: 92, seatRange: 'Floor' },
                    { name: 'VIP', price: 149, capacity: 40, sold: 27, seatRange: 'Balcony' },
                ],
                totalTickets: 160,
                ticketsSold: 119,
                discountCodes: [
                    { code: 'NEON20', discountPercent: 20, active: true, usageLimit: 100, usedCount: 15 },
                ],
                startDate: new Date('2025-12-14'),
                endDate: new Date('2025-12-15'),
                status: 'published',
                featured: true,
                analytics: {
                    popularityScore: 94,
                    heatMap: new Map([['san francisco', 180]]),
                    demographics: new Map([['adults', 210]]),
                },
            },
            {
                title: 'Carbon Neutral Design Workshop',
                description: 'Hands-on workshop for sustainable product designers with prototype clinics and feedback pods.',
                category: 'workshop',
                location: { city: 'Portland', venue: 'Green Foundry', address: '456 Eco Ave' },
                organizer: organizer._id,
                languagesSupported: ['en'],
                tags: ['design', 'sustainability'],
                tierPricing: [
                    { name: 'Standard', price: 129, capacity: 60, sold: 38, seatRange: 'Row A-D' },
                    { name: 'Studio', price: 219, capacity: 20, sold: 12, seatRange: 'Studio 2' },
                ],
                totalTickets: 80,
                ticketsSold: 50,
                discountCodes: [
                    { code: 'ECO15', discountPercent: 15, active: true, usageLimit: 50, usedCount: 8 },
                ],
                startDate: new Date('2026-01-11'),
                endDate: new Date('2026-01-11'),
                status: 'published',
                featured: false,
                analytics: {
                    popularityScore: 81,
                    heatMap: new Map([['portland', 85]]),
                    demographics: new Map([['professionals', 90]]),
                },
            },
            {
                title: 'Future Leaders Summit',
                description: 'Conference uniting student entrepreneurs, investors, and mentors for two days.',
                category: 'conference',
                location: { city: 'New York', venue: 'Harbor Convention Centre', address: '789 Summit Blvd' },
                organizer: organizer._id,
                languagesSupported: ['en', 'fr'],
                tags: ['networking', 'mentorship'],
                tierPricing: [
                    { name: 'Early Bird', price: 199, capacity: 160, sold: 135, seatRange: 'Hall 1' },
                    { name: 'Executive', price: 349, capacity: 60, sold: 26, seatRange: 'Platinum Lounge' },
                ],
                totalTickets: 220,
                ticketsSold: 161,
                discountCodes: [
                    { code: 'REFLECT10', discountPercent: 10, active: true, usageLimit: 200, usedCount: 45 },
                ],
                startDate: new Date('2026-02-05'),
                endDate: new Date('2026-02-07'),
                status: 'published',
                featured: true,
                analytics: {
                    popularityScore: 88,
                    heatMap: new Map([['new york', 330]]),
                    demographics: new Map([['students', 310]]),
                },
            },
            {
                title: 'Jazz Under the Stars',
                description: 'Outdoor jazz festival featuring world-renowned artists in an intimate setting.',
                category: 'music',
                location: { city: 'Austin', venue: 'Starlight Amphitheater', address: '321 Jazz Lane' },
                organizer: organizer._id,
                languagesSupported: ['en'],
                tags: ['outdoor', 'jazz', 'festival'],
                tierPricing: [
                    { name: 'Lawn', price: 45, capacity: 200, sold: 150, seatRange: 'Lawn Area' },
                    { name: 'Reserved', price: 95, capacity: 80, sold: 60, seatRange: 'Rows 1-10' },
                ],
                totalTickets: 280,
                ticketsSold: 210,
                discountCodes: [
                    { code: 'JAZZ25', discountPercent: 25, active: true, usageLimit: 75, usedCount: 30 },
                ],
                startDate: new Date('2025-12-20'),
                endDate: new Date('2025-12-20'),
                status: 'published',
                featured: false,
                analytics: {
                    popularityScore: 92,
                    heatMap: new Map([['austin', 210]]),
                    demographics: new Map([['music lovers', 180]]),
                },
            },
            {
                title: 'Tech Innovation Expo 2026',
                description: 'Explore cutting-edge technology, AI demos, and network with industry leaders.',
                category: 'conference',
                location: { city: 'Seattle', venue: 'Innovation Center', address: '555 Tech Drive' },
                organizer: organizer._id,
                languagesSupported: ['en', 'es', 'fr'],
                tags: ['technology', 'AI', 'networking'],
                tierPricing: [
                    { name: 'General', price: 149, capacity: 300, sold: 180, seatRange: 'Main Hall' },
                    { name: 'VIP', price: 299, capacity: 50, sold: 35, seatRange: 'VIP Lounge' },
                ],
                totalTickets: 350,
                ticketsSold: 215,
                discountCodes: [
                    { code: 'TECH20', discountPercent: 20, active: true, usageLimit: 150, usedCount: 60 },
                ],
                startDate: new Date('2026-03-15'),
                endDate: new Date('2026-03-17'),
                status: 'published',
                featured: true,
                analytics: {
                    popularityScore: 95,
                    heatMap: new Map([['seattle', 215]]),
                    demographics: new Map([['tech professionals', 200]]),
                },
            },
        ]

        await Event.insertMany(events)
        console.log('✅ Seeded events successfully')

        console.log('\n📊 Summary:')
        console.log(`   Users created: 2`)
        console.log(`   Events created: ${events.length}`)
        console.log('\n🔐 Demo Credentials:')
        console.log('   Organizer: organizer@demo.com / demo123456')
        console.log('   User: user@demo.com / demo123456')

        process.exit(0)
    } catch (error) {
        console.error('❌ Seed error:', error)
        process.exit(1)
    }
}

seedData()
