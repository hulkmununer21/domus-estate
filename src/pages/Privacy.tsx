import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - Domus Servitia"
        description="Read our privacy policy to understand how Domus Servitia collects, uses, and protects your personal information. UK GDPR compliant property management services."
        keywords="privacy policy, data protection, GDPR, personal information, UK privacy law"
        canonical="https://domusservitia.co.uk/privacy"
      />
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Domus Servitia ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our property management and lodging services.
                  </p>
                  <p>
                    We are registered in the United Kingdom and comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Personal Information</h3>
                  <p>We may collect the following personal information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, phone number, and postal address</li>
                    <li>Identification documents (e.g., passport, driving license) for tenant verification</li>
                    <li>Financial information for rent payments and deposits</li>
                    <li>Emergency contact information</li>
                    <li>Employment and income verification details</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Property Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Property preferences and search history</li>
                    <li>Viewing appointments and feedback</li>
                    <li>Tenancy agreements and related documentation</li>
                    <li>Maintenance requests and complaints</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To provide property management and lodging services</li>
                    <li>To process rental applications and agreements</li>
                    <li>To communicate with you about properties and services</li>
                    <li>To conduct credit and reference checks</li>
                    <li>To process payments and manage accounts</li>
                    <li>To arrange property viewings and maintenance</li>
                    <li>To comply with legal obligations</li>
                    <li>To improve our services and website functionality</li>
                    <li>To send marketing communications (with your consent)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Legal Basis for Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We process your personal data based on the following legal grounds:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contractual obligations to you</li>
                    <li><strong>Legal Obligation:</strong> Compliance with UK housing laws and regulations</li>
                    <li><strong>Legitimate Interests:</strong> Managing our business operations and improving services</li>
                    <li><strong>Consent:</strong> Where you have provided explicit consent for specific processing activities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Information Sharing and Disclosure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Landlords and Property Owners:</strong> To facilitate rental arrangements</li>
                    <li><strong>Credit Reference Agencies:</strong> For tenant verification purposes</li>
                    <li><strong>Maintenance Contractors:</strong> To provide property maintenance services</li>
                    <li><strong>Legal and Professional Advisors:</strong> For legal compliance and dispute resolution</li>
                    <li><strong>Payment Processors:</strong> To process rental payments securely</li>
                    <li><strong>Government Authorities:</strong> When required by law or to protect rights</li>
                  </ul>
                  <p className="mt-4">
                    We do not sell your personal information to third parties.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Data Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of sensitive data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication procedures</li>
                    <li>Staff training on data protection principles</li>
                    <li>Secure backup and disaster recovery procedures</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Data Retention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Typical retention periods include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Tenancy records:</strong> 6 years after tenancy ends</li>
                    <li><strong>Financial records:</strong> 7 years for tax purposes</li>
                    <li><strong>Marketing consent:</strong> Until consent is withdrawn</li>
                    <li><strong>CCTV footage:</strong> 30 days unless required for investigations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Under UK GDPR, you have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Right of Access:</strong> Request copies of your personal data</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your data in certain circumstances</li>
                    <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
                    <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us using the details provided below.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Cookies and Tracking Technologies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website. For more information, please see our <a href="/cookies" className="text-accent hover:underline">Cookie Policy</a>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10. Third-Party Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>11. Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>12. Changes to This Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the "Last updated" date. We encourage you to review this policy periodically.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>13. Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Domus Servitia</strong></p>
                    <p>Email: privacy@domusservitia.co.uk</p>
                    <p>Phone: +44 (0) 20 1234 5678</p>
                    <p>Address: 123 Property Lane, Manchester, M1 1AA, United Kingdom</p>
                  </div>
                  <p className="mt-4">
                    You also have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection authority, at <a href="https://ico.org.uk" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
