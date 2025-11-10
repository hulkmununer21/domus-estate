import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cookies = () => {
  return (
    <>
      <SEO
        title="Cookie Policy - Domus Servitia"
        description="Learn about how Domus Servitia uses cookies and similar technologies to improve your browsing experience and provide personalized property services."
        keywords="cookie policy, cookies, tracking, website analytics, privacy"
        canonical="https://domusservitia.co.uk/cookies"
      />
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. What Are Cookies?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                  </p>
                  <p>
                    Cookies help us understand how visitors interact with our website, remember your preferences, and improve your overall experience with Domus Servitia's services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. How We Use Cookies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We use cookies for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To enable essential website functionality</li>
                    <li>To remember your preferences and settings</li>
                    <li>To authenticate users and prevent fraud</li>
                    <li>To analyze website traffic and user behavior</li>
                    <li>To personalize content and property recommendations</li>
                    <li>To improve our services and user experience</li>
                    <li>To deliver relevant marketing communications</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Types of Cookies We Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Strictly Necessary Cookies</h3>
                  <p>
                    These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Cookie Name</th>
                          <th className="border border-border p-2 text-left">Purpose</th>
                          <th className="border border-border p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">session_id</td>
                          <td className="border border-border p-2">Manages user session</td>
                          <td className="border border-border p-2">Session</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">auth_token</td>
                          <td className="border border-border p-2">User authentication</td>
                          <td className="border border-border p-2">7 days</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">csrf_token</td>
                          <td className="border border-border p-2">Security protection</td>
                          <td className="border border-border p-2">Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="font-semibold mt-6">Performance Cookies</h3>
                  <p>
                    These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us improve our website performance and user experience.
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Cookie Name</th>
                          <th className="border border-border p-2 text-left">Purpose</th>
                          <th className="border border-border p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">_ga</td>
                          <td className="border border-border p-2">Google Analytics tracking</td>
                          <td className="border border-border p-2">2 years</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">_gid</td>
                          <td className="border border-border p-2">Google Analytics tracking</td>
                          <td className="border border-border p-2">24 hours</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">_gat</td>
                          <td className="border border-border p-2">Google Analytics throttling</td>
                          <td className="border border-border p-2">1 minute</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="font-semibold mt-6">Functionality Cookies</h3>
                  <p>
                    These cookies allow the website to remember choices you make and provide enhanced, personalized features.
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Cookie Name</th>
                          <th className="border border-border p-2 text-left">Purpose</th>
                          <th className="border border-border p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">user_preferences</td>
                          <td className="border border-border p-2">Stores user preferences</td>
                          <td className="border border-border p-2">1 year</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">language</td>
                          <td className="border border-border p-2">Language preference</td>
                          <td className="border border-border p-2">1 year</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">recent_searches</td>
                          <td className="border border-border p-2">Property search history</td>
                          <td className="border border-border p-2">30 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="font-semibold mt-6">Targeting/Advertising Cookies</h3>
                  <p>
                    These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Cookie Name</th>
                          <th className="border border-border p-2 text-left">Purpose</th>
                          <th className="border border-border p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">_fbp</td>
                          <td className="border border-border p-2">Facebook pixel tracking</td>
                          <td className="border border-border p-2">3 months</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">fr</td>
                          <td className="border border-border p-2">Facebook advertising</td>
                          <td className="border border-border p-2">3 months</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">IDE</td>
                          <td className="border border-border p-2">Google DoubleClick</td>
                          <td className="border border-border p-2">1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Third-Party Cookies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
                    <li><strong>Google Maps:</strong> To display property locations</li>
                    <li><strong>Facebook Pixel:</strong> For advertising and retargeting</li>
                    <li><strong>Payment Processors:</strong> To securely process payments</li>
                    <li><strong>Live Chat Services:</strong> To provide customer support</li>
                  </ul>
                  <p className="mt-4">
                    These third parties have their own privacy policies, and we have no responsibility or liability for their policies or practices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Cookie Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Session Cookies</h3>
                  <p>
                    These temporary cookies are deleted when you close your browser. They help us track your session and maintain security.
                  </p>

                  <h3 className="font-semibold mt-4">Persistent Cookies</h3>
                  <p>
                    These cookies remain on your device for a set period or until you delete them. They help us remember your preferences and provide a personalized experience.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Managing Your Cookie Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Browser Settings</h3>
                  <p>
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Clear cookies when you close your browser</li>
                    <li>Delete existing cookies</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Browser-Specific Instructions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                    <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Important Note</h3>
                  <p>
                    If you disable cookies, some features of our website may not function properly, and your user experience may be affected.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Do Not Track Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for how to respond to DNT signals. At this time, our website does not respond to DNT signals.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Changes to This Cookie Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of any significant changes by posting the updated policy on our website.
                  </p>
                  <p>
                    We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. More Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    For more information about cookies and how to manage them, you can visit:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><a href="https://www.aboutcookies.org" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a></li>
                    <li><a href="https://www.allaboutcookies.org" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a></li>
                    <li><a href="https://ico.org.uk/for-the-public/online/cookies" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">ICO Cookie Guidance</a></li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10. Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    If you have any questions about our use of cookies, please contact us:
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

export default Cookies;
