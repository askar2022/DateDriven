interface FooterProps {
  bgColor?: string
  textColor?: string
}

export function Footer({ bgColor = '#1F2937', textColor = '#D1D5DB' }: FooterProps) {
  return (
    <>
      <footer style={{
        backgroundColor: bgColor,
        color: textColor,
        marginTop: '4rem',
        padding: '3rem 1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: `1px solid ${textColor}40`
          }} className="footer-grid">
          
          {/* School Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/hba.png" 
                alt="HBA Logo" 
                style={{
                  width: '3rem',
                  height: '3rem',
                  objectFit: 'contain'
                }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#831843', margin: 0 }}>
                HBA Data Driven
              </h3>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#831843', marginBottom: '0.5rem' }}>
              Excellence in Education
            </p>
            <p style={{ fontSize: '0.875rem', color: '#831843', lineHeight: '1.6' }}>
              Empowering educators with real-time student performance analytics for K-8 excellence
            </p>
          </div>

          {/* Analytics Platform */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#831843', marginBottom: '1rem' }}>
              Analytics Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ fontSize: '0.875rem', color: '#831843' }}>
                • Real-time performance tracking
              </li>
              <li style={{ fontSize: '0.875rem', color: '#831843' }}>
                • Student growth analytics
              </li>
              <li style={{ fontSize: '0.875rem', color: '#831843' }}>
                • Color-coded insights
              </li>
              <li style={{ fontSize: '0.875rem', color: '#831843' }}>
                • Printable reports
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#831843', marginBottom: '1rem' }}>
              Contact
            </h4>
            <div style={{ fontSize: '0.875rem', color: '#831843', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong style={{ color: '#831843' }}>For technical support</strong>
              </p>
              <p style={{ margin: 0 }}>Contact school administration</p>
              <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', fontStyle: 'italic' }}>
                📧 support@hbadatadriven.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.875rem'
        }} className="footer-bottom">
          <div style={{ color: '#831843' }}>
            © 2025 HBA Data Driven. All rights reserved.
          </div>
          <div style={{ color: '#831843' }}>
            Designed and implemented by <span style={{ color: '#DC2626', fontWeight: '600' }}>Dr. Askar</span>
          </div>
        </div>
      </div>
    </footer>

    <style jsx>{`
      @media (max-width: 768px) {
        footer {
          padding: 2rem 1rem 1.5rem !important;
        }
        
        .footer-grid {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
        }
        
        .footer-bottom {
          flex-direction: column !important;
          text-align: center !important;
          gap: 0.5rem !important;
        }
      }

      @media (max-width: 480px) {
        footer h3 {
          font-size: 1rem !important;
        }
        
        footer h4 {
          font-size: 0.875rem !important;
        }
        
        footer p, footer li {
          font-size: 0.75rem !important;
        }
      }
    `}</style>
  </>
  )
}
