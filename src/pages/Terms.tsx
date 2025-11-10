import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <SEO
        title="Terms of Service - Domus Servitia"
        description="Read our terms of service to understand the conditions for using Domus Servitia's property management and lodging services in the UK."
        keywords="terms of service, terms and conditions, user agreement, property rental terms"
        canonical="https://domusservitia.co.uk/terms"
      />
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    By accessing or using the services provided by Domus Servitia ("Company", "we", "our", or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and Domus Servitia. By using our services, you represent that you are at least 18 years of age and have the legal capacity to enter into these Terms.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Services Provided</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Domus Servitia provides the following services:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Property management and maintenance services</li>
                    <li>Lodging and accommodation rental services</li>
                    <li>Property listing and viewing arrangements</li>
                    <li>Tenant and landlord portal access</li>
                    <li>Online payment processing facilities</li>
                    <li>Maintenance request management</li>
                    <li>Property inspection services</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. User Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Account Registration</h3>
                  <p>
                    To access certain features of our services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                  </p>
                  
                  <h3 className="font-semibold mt-4">Account Security</h3>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                  </p>

                  <h3 className="font-semibold mt-4">Account Types</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Lodger Account:</strong> For individuals seeking accommodation</li>
                    <li><strong>Landlord Account:</strong> For property owners listing properties</li>
                    <li><strong>Staff Account:</strong> For authorized Domus Servitia personnel</li>
                    <li><strong>Admin Account:</strong> For administrative management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Property Listings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Listing Accuracy</h3>
                  <p>
                    We strive to ensure that all property listings are accurate and up-to-date. However, we do not guarantee the accuracy, completeness, or reliability of any property information. Property availability is subject to change without notice.
                  </p>

                  <h3 className="font-semibold mt-4">Property Viewings</h3>
                  <p>
                    Property viewings are arranged subject to availability. You must provide reasonable notice if you need to cancel or reschedule a viewing appointment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Rental Agreements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Tenancy Terms</h3>
                  <p>
                    All rental agreements are subject to a separate tenancy agreement that will be provided upon acceptance of your application. The tenancy agreement will contain specific terms regarding rent, duration, responsibilities, and termination.
                  </p>

                  <h3 className="font-semibold mt-4">Application Process</h3>
                  <p>
                    Rental applications are subject to credit checks, reference checks, and employment verification. We reserve the right to accept or reject any application at our sole discretion.
                  </p>

                  <h3 className="font-semibold mt-4">Deposits and Rent</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Security deposits are protected in a government-approved tenancy deposit scheme</li>
                    <li>Rent must be paid on the agreed date each month</li>
                    <li>Late payment charges may apply as specified in your tenancy agreement</li>
                    <li>All payments must be made through our secure payment system</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Landlord Obligations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>If you are a landlord using our services, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate property information and documentation</li>
                    <li>Ensure all properties meet legal safety standards</li>
                    <li>Maintain valid gas safety certificates, EPC ratings, and electrical safety certificates</li>
                    <li>Comply with all applicable housing regulations and laws</li>
                    <li>Pay agreed management fees on time</li>
                    <li>Respond promptly to maintenance requests</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Tenant Obligations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>If you are a tenant using our services, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pay rent and other charges on time</li>
                    <li>Maintain the property in good condition</li>
                    <li>Report maintenance issues promptly</li>
                    <li>Comply with the terms of your tenancy agreement</li>
                    <li>Not cause nuisance or disturbance to neighbors</li>
                    <li>Allow access for inspections and repairs with proper notice</li>
                    <li>Not sublet the property without written permission</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Payment Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Accepted Payment Methods</h3>
                  <p>
                    We accept payments via bank transfer, debit card, and credit card through our secure payment system. All payment information is processed securely.
                  </p>

                  <h3 className="font-semibold mt-4">Fees and Charges</h3>
                  <p>
                    All fees and charges will be clearly disclosed before any transaction. Additional fees may apply for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Late rent payments</li>
                    <li>Damage beyond normal wear and tear</li>
                    <li>Early termination of tenancy</li>
                    <li>Lost keys or access cards</li>
                    <li>Additional cleaning services</li>
                  </ul>

                  <h3 className="font-semibold mt-4">Refunds</h3>
                  <p>
                    Refund policies vary depending on the service. Security deposits will be returned in accordance with the tenancy deposit protection scheme rules and your tenancy agreement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Maintenance and Repairs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We provide maintenance and repair services for properties under our management. Tenants must report maintenance issues through the tenant portal. Emergency repairs will be prioritized, while non-urgent repairs will be addressed within a reasonable timeframe.
                  </p>
                  <p>
                    Tenants may be charged for repairs if damage is caused by misuse or negligence.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10. Prohibited Activities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>When using our services, you must not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide false or misleading information</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Interfere with or disrupt our services</li>
                    <li>Access another user's account without permission</li>
                    <li>Use our services for any illegal purpose</li>
                    <li>Harass, threaten, or abuse our staff or other users</li>
                    <li>Attempt to circumvent our security measures</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>11. Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    All content on our website and services, including text, graphics, logos, images, and software, is the property of Domus Servitia or its licensors and is protected by UK and international copyright laws.
                  </p>
                  <p>
                    You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>12. Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    To the fullest extent permitted by law, Domus Servitia shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
                  </p>
                  <p>
                    Our total liability to you for any claims arising from these Terms or our services shall not exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                  <p>
                    Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>13. Indemnification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    You agree to indemnify and hold harmless Domus Servitia, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your breach of these Terms or your use of our services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>14. Termination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We reserve the right to suspend or terminate your account and access to our services at any time, with or without notice, for any reason, including if we believe you have violated these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use our services will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including liability limitations and dispute resolution provisions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>15. Dispute Resolution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold">Complaints Procedure</h3>
                  <p>
                    If you have a complaint, please contact us first to allow us to resolve the issue. We have an internal complaints procedure and aim to resolve all complaints within 28 days.
                  </p>

                  <h3 className="font-semibold mt-4">Governing Law</h3>
                  <p>
                    These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>16. Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We may modify these Terms at any time by posting the updated Terms on our website. Your continued use of our services after changes are posted constitutes your acceptance of the modified Terms.
                  </p>
                  <p>
                    We will notify you of significant changes via email or through a prominent notice on our website.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>17. Severability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>18. Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Domus Servitia</strong></p>
                    <p>Email: legal@domusservitia.co.uk</p>
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

export default Terms;
