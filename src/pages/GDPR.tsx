import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, UserCheck, AlertTriangle } from "lucide-react";

const GDPR = () => {
  return (
    <>
      <SEO
        title="GDPR Compliance - Domus Servitia"
        description="Learn how Domus Servitia complies with UK GDPR and data protection regulations to safeguard your personal information and privacy rights."
        keywords="GDPR compliance, UK GDPR, data protection, personal data, privacy rights, data security"
        canonical="https://domusservitia.co.uk/gdpr"
      />
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-accent" />
                <h1 className="text-4xl font-bold">GDPR Compliance</h1>
              </div>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Our Commitment to Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Domus Servitia is committed to protecting your personal data and respecting your privacy rights in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                  </p>
                  <p>
                    We have implemented comprehensive policies, procedures, and technical measures to ensure that your personal data is processed lawfully, fairly, and transparently.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Protection Principles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We adhere to the following GDPR principles when processing your personal data:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-accent" />
                        Lawfulness, Fairness & Transparency
                      </h3>
                      <p className="text-sm">We process data lawfully, fairly, and in a transparent manner.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-accent" />
                        Purpose Limitation
                      </h3>
                      <p className="text-sm">Data is collected for specified, explicit, and legitimate purposes.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-accent" />
                        Data Minimization
                      </h3>
                      <p className="text-sm">We only collect data that is adequate, relevant, and necessary.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-accent" />
                        Accuracy
                      </h3>
                      <p className="text-sm">We keep personal data accurate and up to date.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-accent" />
                        Storage Limitation
                      </h3>
                      <p className="text-sm">Data is kept only as long as necessary for its purpose.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-accent" />
                        Integrity & Confidentiality
                      </h3>
                      <p className="text-sm">We ensure appropriate security of personal data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your GDPR Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Under UK GDPR, you have the following rights regarding your personal data:</p>

                  <div className="space-y-4 mt-4">
                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">1. Right to be Informed</h3>
                      <p className="text-sm">
                        You have the right to clear, transparent information about how we use your personal data. This is provided through our Privacy Policy and this GDPR statement.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">2. Right of Access</h3>
                      <p className="text-sm">
                        You have the right to access your personal data and supplementary information. You can request a copy of the personal data we hold about you free of charge.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">3. Right to Rectification</h3>
                      <p className="text-sm">
                        You have the right to have inaccurate personal data corrected or completed if it is incomplete. We will respond to rectification requests within one month.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">4. Right to Erasure (Right to be Forgotten)</h3>
                      <p className="text-sm">
                        In certain circumstances, you have the right to request deletion of your personal data. This is not an absolute right and applies only in specific cases.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">5. Right to Restrict Processing</h3>
                      <p className="text-sm">
                        You have the right to request that we restrict processing of your personal data in certain circumstances, such as when you contest the accuracy of the data.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">6. Right to Data Portability</h3>
                      <p className="text-sm">
                        You have the right to obtain and reuse your personal data for your own purposes across different services, in a structured, commonly used, and machine-readable format.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">7. Right to Object</h3>
                      <p className="text-sm">
                        You have the right to object to processing based on legitimate interests, direct marketing (including profiling), and processing for research/statistical purposes.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h3 className="font-semibold mb-2">8. Rights Related to Automated Decision Making</h3>
                      <p className="text-sm">
                        You have the right not to be subject to decisions based solely on automated processing, including profiling, which produces legal or similarly significant effects.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Exercise Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    To exercise any of your GDPR rights, please submit a written request to our Data Protection Officer using the contact details below. We will respond to your request within one month.
                  </p>

                  <h3 className="font-semibold mt-4">What You Need to Provide</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your full name and contact details</li>
                    <li>Details of your specific request</li>
                    <li>Proof of identity (for security purposes)</li>
                    <li>Any relevant reference numbers (e.g., tenancy reference)</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Response Timeframes</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Standard requests:</strong> 1 month from receipt</li>
                    <li><strong>Complex requests:</strong> Up to 3 months with notification</li>
                    <li><strong>Data breach notifications:</strong> Within 72 hours</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal Bases for Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We process your personal data under the following legal bases:</p>

                  <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-3 text-left">Processing Activity</th>
                          <th className="border border-border p-3 text-left">Legal Basis</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3">Managing tenancy agreements</td>
                          <td className="border border-border p-3">Contract Performance</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Processing rent payments</td>
                          <td className="border border-border p-3">Contract Performance</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Credit and reference checks</td>
                          <td className="border border-border p-3">Legitimate Interest</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Tax compliance and reporting</td>
                          <td className="border border-border p-3">Legal Obligation</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Anti-money laundering checks</td>
                          <td className="border border-border p-3">Legal Obligation</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Marketing communications</td>
                          <td className="border border-border p-3">Consent</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Service improvements</td>
                          <td className="border border-border p-3">Legitimate Interest</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security Measures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We implement robust technical and organizational measures to protect your personal data:
                  </p>

                  <h3 className="font-semibold mt-4">Technical Measures</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>SSL/TLS encryption for data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Firewalls and intrusion detection systems</li>
                    <li>Multi-factor authentication for staff access</li>
                    <li>Regular software updates and security patches</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Organizational Measures</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Data protection impact assessments</li>
                    <li>Staff training on data protection</li>
                    <li>Access controls and need-to-know principles</li>
                    <li>Confidentiality agreements with staff and contractors</li>
                    <li>Incident response and breach notification procedures</li>
                    <li>Regular policy reviews and updates</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Breach Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    In the event of a data breach that poses a risk to your rights and freedoms, we will:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Notify the Information Commissioner's Office (ICO) within 72 hours</li>
                    <li>Notify affected individuals without undue delay if the breach poses a high risk</li>
                    <li>Document all data breaches, including facts, effects, and remedial action</li>
                    <li>Take immediate steps to contain and mitigate the breach</li>
                    <li>Review and update security measures to prevent future breaches</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>International Data Transfers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We primarily store and process data within the United Kingdom. If we transfer data outside the UK, we ensure appropriate safeguards are in place, such as:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>UK adequacy decisions</li>
                    <li>Standard contractual clauses approved by the ICO</li>
                    <li>Binding corporate rules</li>
                    <li>Certification schemes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Protection Officer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We have appointed a Data Protection Officer (DPO) to oversee our GDPR compliance. You can contact our DPO with any questions or concerns about how we process your personal data.
                  </p>
                  <div className="space-y-2 mt-4">
                    <p><strong>Data Protection Officer</strong></p>
                    <p>Email: dpo@domusservitia.co.uk</p>
                    <p>Phone: +44 (0) 20 1234 5679</p>
                    <p>Address: 123 Property Lane, Manchester, M1 1AA, United Kingdom</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complaints and Supervisory Authority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection supervisory authority.
                  </p>
                  <div className="space-y-2 mt-4">
                    <p><strong>Information Commissioner's Office (ICO)</strong></p>
                    <p>Website: <a href="https://ico.org.uk" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a></p>
                    <p>Telephone: 0303 123 1113</p>
                    <p>Address: Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Updates to This Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We may update this GDPR compliance statement from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes through our website or by email.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    For any questions about our GDPR compliance or to exercise your rights, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Domus Servitia</strong></p>
                    <p>Email: privacy@domusservitia.co.uk</p>
                    <p>Phone: +44 (0) 20 1234 5678</p>
                    <p>Address: 123 Property Lane, Manchester, M1 1AA, United Kingdom</p>
                  </div>
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

export default GDPR;
