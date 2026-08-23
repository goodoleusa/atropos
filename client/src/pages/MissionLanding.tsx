import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Heart,
  Users,
  TrendingUp,
  Award,
  Globe,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  DollarSign
} from 'lucide-react';

export default function MissionLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-black to-amber-500/10" />
        
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          {/* Alert Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-700 text-sm font-semibold mb-8">
            <AlertTriangle className="w-4 h-4" />
            40 MILLION PEOPLE ENSLAVED RIGHT NOW
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="text-amber-800">
              Train Ethical Hackers
            </span>
            <br />
            <span className="text-foreground">
              to Fight Trafficking
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Learn real-world OSINT and cyber investigation techniques used by FBI, Interpol, and NGOs
            to combat human trafficking and financial crime.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/campaigns">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6">
                Start Free Training
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/investors">
              <Button size="lg" variant="outline" className="border-amber-500 text-amber-800 hover:bg-amber-500/10 text-lg px-8 py-6">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-amber-800">10,000+</div>
              <div className="text-sm text-muted-foreground">Investigators Trained</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-800">50+</div>
              <div className="text-sm text-muted-foreground">Cases Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400">20+</div>
              <div className="text-sm text-muted-foreground">Victims Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-700">5+</div>
              <div className="text-sm text-muted-foreground">Networks Disrupted</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted rounded-full p-1">
            <div className="w-1 h-2 bg-amber-500 rounded-full mx-auto" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-red-700">Problem</span> We're Solving
            </h2>
            <p className="text-xl text-muted-foreground">
              Human trafficking is a $150 billion industry. Technology enables it. Technology can stop it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/90 border-red-500/30 p-8">
              <AlertTriangle className="w-12 h-12 text-red-700 mb-4" />
              <h3 className="text-2xl font-bold mb-3">The Crisis</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 40.3M victims globally</li>
                <li>• $150B criminal industry</li>
                <li>• 85% recruited via social media</li>
                <li>• Crypto hides money trail</li>
              </ul>
            </Card>

            <Card className="bg-card/90 border-amber-500/30 p-8">
              <Users className="w-12 h-12 text-amber-800 mb-4" />
              <h3 className="text-2xl font-bold mb-3">The Gap</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 100,000+ open cases</li>
                <li>• 1 investigator per 10k victims</li>
                <li>• NGOs lack tech skills</li>
                <li>• Months per investigation</li>
              </ul>
            </Card>

            <Card className="bg-card/90 border-emerald-500/30 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Our Solution</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Train 10k ethical hackers</li>
                <li>• AI agents scale 100x</li>
                <li>• Deploy on real cases</li>
                <li>• Track criminals, rescue victims</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-card to-black border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="text-teal-800">It Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From student to professional investigator in months, not years
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                1
              </div>
              <Card className="bg-card/50 border-border p-6 flex-1">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Target className="w-6 h-6 text-amber-800" />
                  Learn Real Investigation Techniques
                </h3>
                <p className="text-muted-foreground mb-4">
                  Complete 23+ investigation campaigns teaching social media OSINT, cryptocurrency tracing,
                  dark web analysis, and corporate intelligence - the same methods used by FBI and Interpol.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-teal-500/30 text-teal-800">
                    Social Media Investigation
                  </Badge>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-800">
                    Blockchain Forensics
                  </Badge>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-800">
                    Dark Web OSINT
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-teal-500/20 border-2 border-teal-500 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                2
              </div>
              <Card className="bg-card/50 border-border p-6 flex-1">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Award className="w-6 h-6 text-teal-800" />
                  Get Certified & Build Portfolio
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn achievements, complete challenges, and build a professional portfolio of investigations.
                  Generate reports that impress law enforcement and NGO employers.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    Professional Reports
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    Career Certification
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    Job Placement
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                3
              </div>
              <Card className="bg-card/50 border-border p-6 flex-1">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-700" />
                  Support Real Cases & Get Paid
                </h3>
                <p className="text-muted-foreground mb-4">
                  Top students become Research Fellows, supporting real investigations for NGOs and law enforcement.
                  Get paid while making an impact. Direct path to careers at Polaris, Thorn, FBI, or HSI.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-red-500/30 text-red-700">
                    Paid Investigations
                  </Badge>
                  <Badge variant="outline" className="border-red-500/30 text-red-700">
                    Real-World Impact
                  </Badge>
                  <Badge variant="outline" className="border-red-500/30 text-red-700">
                    Career Pipeline
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Showcase */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-red-500/20 text-red-700 border-red-500/30 mb-4">
              OSINT for Good
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Investigation <span className="text-amber-800">Campaigns</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Master real-world techniques through realistic scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                id: 'operation_shadow_network',
                name: 'Operation Shadow Network',
                icon: '🕵️',
                difficulty: 'intermediate',
                time: '60-90 min',
                description: 'Track trafficking recruitment on social media and trace crypto payments',
                techniques: ['Instagram OSINT', 'Crypto Tracing', 'Network Mapping'],
                realWorld: 'FBI methodology for online recruitment investigations'
              },
              {
                id: 'dark_web_marketplace_shutdown',
                name: 'Dark Web Marketplace',
                icon: '🌐',
                difficulty: 'advanced',
                time: '90-120 min',
                description: 'Safely investigate dark web infrastructure and identify operators',
                techniques: ['Safe Dark Web Investigation', 'Infrastructure Mapping', 'Opsec Analysis'],
                realWorld: 'Interpol takedown methodology (Silk Road, AlphaBay)'
              },
              {
                id: 'crypto_laundering_trace',
                name: 'Cryptocurrency Laundering',
                icon: '💰',
                difficulty: 'advanced',
                time: '60-90 min',
                description: 'Trace $500k through mixers and exchanges using FBI techniques',
                techniques: ['Blockchain Forensics', 'Mixer Detection', 'Exchange Identification'],
                realWorld: 'Colonial Pipeline recovery methodology ($2.3M traced)'
              },
              {
                id: 'victim_geolocation',
                name: 'Victim Identification',
                icon: '📍',
                difficulty: 'expert',
                time: '120+ min',
                description: 'Visual geolocation and image forensics for victim identification',
                techniques: ['Geolocation', 'Image Forensics', 'Temporal Analysis'],
                realWorld: 'Interpol Project VIC (10,000+ victims identified)'
              }
            ].map((campaign) => (
              <Card key={campaign.id} className="bg-card/90 border-border p-6 hover:border-amber-500/30 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{campaign.icon}</div>
                  <Badge className={
                    campaign.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                    campaign.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-800' :
                    campaign.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-800' :
                    'bg-red-500/20 text-red-700'
                  }>
                    {campaign.difficulty}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{campaign.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.techniques.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs border-border text-muted-foreground">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground mb-4 italic">
                  Real-world: {campaign.realWorld}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{campaign.time}</span>
                  <Link href={`/play/${campaign.id}`}>
                    <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 border border-amber-500/30">
                      Start Mission
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/campaigns">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-border">
                View All 23+ Campaigns
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted <span className="text-teal-800">Partners</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Working with leading organizations to combat trafficking
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { name: 'FBI VCAC', desc: 'Case Support' },
              { name: 'Polaris Project', desc: 'Partnership' },
              { name: 'Thorn', desc: 'Technology Partner' },
              { name: 'NCMEC', desc: 'Training Alliance' },
              { name: 'HSI', desc: 'Gov Contract' },
              { name: 'Interpol', desc: 'International' },
              { name: 'IJM', desc: 'Global Operations' },
              { name: 'OUR', desc: 'Field Ops' }
            ].map((partner) => (
              <div key={partner.name} className="text-center">
                <div className="text-lg font-semibold text-foreground mb-1">{partner.name}</div>
                <div className="text-sm text-muted-foreground">{partner.desc}</div>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            * Partnership discussions in progress
          </div>
        </div>
      </section>

      {/* Business Model Section (Investors) */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mission <span className="text-emerald-400">+ Money</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Sustainable business model with exceptional unit economics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/90 border-emerald-500/30 p-6">
              <DollarSign className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">$500K ARR</h3>
              <p className="text-muted-foreground mb-4">Year 1 Target</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Education: $100k</li>
                <li>• Government: $200k</li>
                <li>• Corporate: $125k</li>
                <li>• Grants: $75k</li>
              </ul>
            </Card>

            <Card className="bg-card/90 border-teal-500/30 p-6">
              <TrendingUp className="w-12 h-12 text-teal-800 mb-4" />
              <h3 className="text-2xl font-bold mb-2">36:1</h3>
              <p className="text-muted-foreground mb-4">LTV:CAC Ratio</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CAC: $2,000</li>
                <li>• LTV: $72,000</li>
                <li>• Industry: 3:1</li>
                <li>• We're 12x better</li>
              </ul>
            </Card>

            <Card className="bg-card/90 border-amber-500/30 p-6">
              <Zap className="w-12 h-12 text-amber-800 mb-4" />
              <h3 className="text-2xl font-bold mb-2">99%</h3>
              <p className="text-muted-foreground mb-4">Gross Margin</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI cost: $50/client</li>
                <li>• Client pays: $10k</li>
                <li>• Traditional: $50k</li>
                <li>• Infinite scale</li>
              </ul>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/investors">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                View Investor Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Career Paths Section */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Launch Your <span className="text-amber-800">Career</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Training leads directly to jobs in ethical hacking for social good
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'FBI Special Agent',
                org: 'FBI Violent Crimes Against Children',
                salary: '$80k-$150k',
                icon: Shield
              },
              {
                title: 'NGO Investigator',
                org: 'Polaris, Thorn, NCMEC, IJM',
                salary: '$60k-$100k',
                icon: Heart
              },
              {
                title: 'Financial Crime Analyst',
                org: 'Banks, FinCEN, OFAC',
                salary: '$70k-$120k',
                icon: DollarSign
              },
              {
                title: 'OSINT Analyst',
                org: 'Security firms, consulting',
                salary: '$80k-$140k',
                icon: Target
              },
              {
                title: 'Digital Forensics',
                org: 'Law enforcement, private sector',
                salary: '$75k-$130k',
                icon: Globe
              },
              {
                title: 'Research Fellow',
                org: 'Atropos (paid training)',
                salary: '$500-$1,000/month',
                icon: Award
              }
            ].map((career) => (
              <Card key={career.title} className="bg-card/50 border-border p-6">
                <career.icon className="w-10 h-10 text-amber-800 mb-4" />
                <h3 className="text-lg font-bold mb-2">{career.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{career.org}</p>
                <div className="text-xl font-bold text-emerald-400">{career.salary}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make an <span className="text-red-700">Impact</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join the fight against human trafficking. Learn skills that save lives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campaigns">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6 w-full sm:w-auto">
                Start Free Training
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/investors">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-border text-lg px-8 py-6 w-full sm:w-auto">
                For Investors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
