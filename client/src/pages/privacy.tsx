import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        <Card className="card-gradient rounded-2xl shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Email Address:</strong> Used for account creation, login, and important communications</li>
                <li><strong>Name (First and Last):</strong> Used for personalization and social features</li>
                <li><strong>Date of Birth:</strong> Used for age verification and age-appropriate content</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Location Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Precise Location:</strong> Used to find nearby spots, cafes, restaurants, and fitness locations</li>
                <li><strong>Location History:</strong> Used to improve recommendations and verify check-ins</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide location-based spot discovery and recommendations</li>
                <li>Verify your identity and manage your account</li>
                <li>Personalize your experience within the app</li>
                <li>Ensure age-appropriate access to features</li>
                <li>Improve our services and app functionality</li>
                <li>Send important account and service notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
              <p className="font-medium text-gray-800">We do NOT share your personal information with third parties, except:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>With your explicit consent</li>
                <li>In connection with a business transfer (merger, acquisition, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Your data is stored securely using industry-standard encryption</li>
                <li>Location data is processed locally on your device when possible</li>
                <li>We implement appropriate technical and organizational measures to protect your data</li>
                <li>Access to personal data is limited to authorized personnel only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights and Choices</h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Location Services</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>You can disable location services through your device settings</li>
                <li>Disabling location will limit some app functionality</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Account Management</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Update your personal information through app settings</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Children's Privacy</h2>
              <p>
                We are committed to protecting children's privacy. Users must be at least 13 years old.
                For users under 18, we encourage parental involvement in their use of Socialiser.
                We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Account information is retained while your account is active</li>
                <li>Location data is retained only as long as necessary for app functionality</li>
                <li>You can request deletion of your data at any time</li>
                <li>Some data may be retained for legal compliance or legitimate business purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new policy in the app. Your continued use constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or how we handle your data,
                please contact us through the app settings or support page.
              </p>
            </section>

            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-8">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Privacy Matters</h3>
              <p className="text-sm text-green-700">
                We are committed to transparency and protecting your privacy. This policy explains exactly
                what data we collect, why we collect it, and how you can control your information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}