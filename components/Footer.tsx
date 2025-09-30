interface FooterProps {
  bgColor?: string
  textColor?: string
}

export function Footer({ bgColor = '#1F2937', textColor = '#D1D5DB' }: FooterProps) {
  return (
    <footer style={{
      backgroundColor: bgColor,
      color: textColor,
      marginTop: '4rem',
      padding: '3rem 2rem 2rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: `1px solid ${textColor}40`
        }}>
          
          {/* School Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/hba.png" 
                alt="HBA Logo" 
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: 0 }}>
                HBA Data Driven
              </h3>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
              Excellence in Education
            </p>
            <p style={{ fontSize: '0.875rem', color: textColor, lineHeight: '1.6' }}>
              Empowering educators with real-time student performance analytics for K-8 excellence
            </p>
          </div>

          {/* Analytics Platform */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
              Analytics Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ fontSize: '0.875rem', color: textColor }}>
                • Real-time performance tracking
              </li>
              <li style={{ fontSize: '0.875rem', color: textColor }}>
                • Student growth analytics
              </li>
              <li style={{ fontSize: '0.875rem', color: textColor }}>
                • Color-coded insights
              </li>
              <li style={{ fontSize: '0.875rem', color: textColor }}>
                • Printable reports
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
              Contact
            </h4>
            <div style={{ fontSize: '0.875rem', color: textColor, lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong style={{ color: 'white' }}>For technical support</strong>
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
        }}>
          <div style={{ color: textColor }}>
            © 2025 HBA Data Driven. All rights reserved.
          </div>
          <div style={{ color: textColor }}>
            Designed and implemented by <span style={{ color: '#EF4444', fontWeight: '600' }}>Dr. Askar</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
