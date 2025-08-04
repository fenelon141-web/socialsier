import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
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
              Terms & Conditions
            </CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Socialiser, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Age Requirements</h2>
              <p>
                You must be at least 13 years old to use Socialiser. Users between 13-17 years old must have parental consent.
                By creating an account, you confirm you meet these age requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information when registering</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
              <p>You agree not to use Socialiser to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Upload, post, or transmit any content that is unlawful, harmful, or offensive</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Attempt to gain unauthorized access to other accounts or systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Location Services</h2>
              <p>
                Socialiser uses location data to provide location-based features such as finding nearby spots.
                Location data is processed locally on your device and only used for app functionality.
                You can disable location services at any time through your device settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Content and Intellectual Property</h2>
              <p>
                All content and materials available through Socialiser are protected by intellectual property rights.
                You retain ownership of content you post, but grant us a license to use it within the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect,
                use, and protect your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
              <p>
                We strive to keep Socialiser available at all times, but we cannot guarantee uninterrupted service.
                We may modify, suspend, or discontinue the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>
                Socialiser is provided "as is" without warranties of any kind. We shall not be liable for any
                indirect, incidental, special, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                posting. Your continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us through the app
                or visit our support page.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}