export const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Real Fit</title>
  <link rel="icon" type="image/svg+xml" href="https://gym-management-web.pages.dev/favicon.svg">
  <style>
    :root {
      --primary: #FF5A36;
      --primary-dark: #E04625;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border: #E2E8F0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.65;
      padding: 0;
      margin: 0;
    }
    header {
      background: #0F172A;
      color: #FFFFFF;
      padding: 24px 20px;
      border-bottom: 3px solid var(--primary);
    }
    .header-container {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      background: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      color: #fff;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    main {
      max-width: 860px;
      margin: 36px auto;
      padding: 0 20px 80px 20px;
    }
    .policy-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .last-updated {
      display: inline-block;
      background: #FFF1EE;
      color: var(--primary-dark);
      font-weight: 700;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.75px;
      margin-bottom: 12px;
      color: var(--text-main);
    }
    .intro {
      font-size: 16px;
      color: var(--text-muted);
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 36px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      margin-bottom: 16px;
      color: var(--text-muted);
      font-size: 15px;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 20px;
      color: var(--text-muted);
    }
    li {
      margin-bottom: 8px;
      font-size: 15px;
    }
    strong {
      color: var(--text-main);
    }
    .highlight-box {
      background: #F1F5F9;
      border-left: 4px solid var(--primary);
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 14px;
    }
    footer {
      text-align: center;
      color: #94A3B8;
      font-size: 13px;
      margin-top: 40px;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }
    a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }
    @media (max-width: 640px) {
      .policy-card {
        padding: 24px 20px;
      }
      h1 {
        font-size: 26px;
      }
    }
  </style>
</head>
<body>

  <header>
    <div class="header-container">
      <a href="/" class="brand">
        <div class="brand-logo">RF</div>
        <div>
          <div class="brand-title">Real Fit</div>
          <div class="brand-subtitle">Workout & Gym Partner Network</div>
        </div>
      </a>
    </div>
  </header>

  <main>
    <div class="policy-card">
      <div class="last-updated">Last Updated: October 31, 2026</div>
      <h1>Privacy Policy</h1>
      <p class="intro">
        This Privacy Policy explains how <strong>Real Fit</strong> ("we", "our", or "us"), operated by Real Result Dev, collects, uses, protects, and discloses personal data when you use the <strong>Real Fit</strong> mobile application and web platform.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We only collect information necessary to provide you with workout tracking, exercise guides, and partner gym check-in services:</p>
      <ul>
        <li><strong>Account & Profile Information:</strong> When you register or create a profile, we may collect your name, email address, phone number, and optional fitness goals.</li>
        <li><strong>Fitness & Activity Data:</strong> Details about the workouts you log, exercises performed, sets, repetitions, weights recorded, and completion timestamps.</li>
        <li><strong>Partner Gym Attendance & Check-In:</strong> When you use Real Fit to check in to an affiliated gym, your check-in timestamp and member identification number are recorded for membership verification.</li>
        <li><strong>Device Information:</strong> Technical details such as device model, operating system version, app version, and basic performance logs to troubleshoot errors and ensure stability.</li>
      </ul>

      <div class="highlight-box">
        <strong>No Sensitive Permissions:</strong> Real Fit does not track your background GPS location, access your microphone, or inspect personal media files outside user-initiated profile uploads.
      </div>

      <h2>2. How We Use Your Information</h2>
      <p>Your information is used strictly to fulfill the core functions of the Real Fit platform:</p>
      <ul>
        <li>Deliver personalized workout routines, exercise technique tutorials, and progress statistics.</li>
        <li>Verify and log member visits at Real Fit partner gym facilities.</li>
        <li>Maintain and improve app functionality, performance, and cross-platform compatibility.</li>
        <li>Provide customer support and respond to user inquiries.</li>
        <li>Send critical transactional notices regarding your account or gym membership status.</li>
      </ul>

      <h2>3. Data Sharing and Disclosure</h2>
      <p>We respect your privacy and <strong>do not sell, rent, or trade your personal information</strong> to third parties for advertising or marketing.</p>
      <p>We only share information under the following limited conditions:</p>
      <ul>
        <li><strong>Partner Gyms:</strong> When you check in at a physical gym utilizing the Real Fit Partner platform, your membership status and check-in confirmation are shared with that gym operator.</li>
        <li><strong>Service Providers:</strong> Trusted cloud hosting providers (e.g., Cloudflare) that assist us in operating our platform under strict confidentiality agreements.</li>
        <li><strong>Legal Requirements:</strong> If required by law, subpoena, or lawful government regulation to comply with legal obligations.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We take appropriate technical and organizational measures to safeguard your personal data. All data transmitted between the Real Fit application and our servers is secured using modern Transport Layer Security (TLS/SSL) encryption. Access to user data is strictly limited to authorized personnel with a legitimate operational need.</p>

      <h2>5. Data Retention and Account Deletion</h2>
      <p>We retain your personal data for as long as your Real Fit account remains active or as needed to provide you with services. You have the right to request deletion of your account and all associated personal data at any time.</p>
      <p>To request permanent deletion of your data, you can contact us directly at <a href="mailto:support@realresultdev.com">support@realresultdev.com</a>. Upon verification, your profile and fitness history will be permanently deleted from our primary databases within 30 days.</p>

      <h2>6. Children's Privacy</h2>
      <p>Real Fit is intended for general audiences aged 13 and older. We do not knowingly collect or solicit personal data from children under the age of 13. If we become aware that personal data from a child under 13 has been collected without parental consent, we will promptly delete that information.</p>

      <h2>7. Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time to reflect changes in our services or legal obligations. We encourage you to review this page periodically. Continued use of Real Fit following the posting of changes constitutes acceptance of those changes.</p>

      <h2>8. Contact Us</h2>
      <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@realresultdev.com">support@realresultdev.com</a></li>
        <li><strong>Developer:</strong> Real Result Dev</li>
        <li><strong>Application:</strong> Real Fit</li>
        <li><strong>Website:</strong> <a href="https://fit.realresult.in" target="_blank" rel="noopener">https://fit.realresult.in</a></li>
      </ul>

      <footer>
        &copy; 2026 Real Fit by Real Result Dev. All rights reserved.
      </footer>
    </div>
  </main>

</body>
</html>
`;

