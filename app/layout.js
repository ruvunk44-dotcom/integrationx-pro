import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'IntegrationX Pro — Master SAP BTP, Integration Suite & Enterprise IT',
  description: 'The premium learning platform for SAP professionals. Master SAP BTP, Integration Suite, CPI, ABAP, Fiori, SuccessFactors — plus AWS, AI, DevOps. Live cohorts, expert mentors, verified certificates.',
  keywords: ['SAP BTP', 'SAP Integration Suite', 'SAP CPI', 'SAP ABAP', 'SAP Fiori', 'SAP SuccessFactors', 'IT courses', 'AWS', 'DevOps', 'certification'],
  openGraph: {
    title: 'IntegrationX Pro — SAP BTP & Integration Suite Experts',
    description: 'Master SAP BTP and Integration Suite with world-class architects. Live classes, real projects, verified certificates.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  )
}
