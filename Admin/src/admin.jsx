import React, { useRef, useState } from 'react';
import './styles/Admin.css';

function Admin() {
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedImage, setSelectedImage] = useState(null);
  const [skillsImage, setSkillsImage] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  const [contactImage, setContactImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const adminSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      description: 'Overview and analytics',
      color: '#8B5CF6'
    },
    {
      id: 'about',
      title: 'About Section',
      icon: '👤',
      description: 'Personal information and bio',
      color: '#EC4899'
    },
    {
      id: 'skills',
      title: 'Skills Section',
      icon: '🛠️',
      description: 'Technical skills and expertise',
      color: '#06B6D4'
    },
    {
      id: 'projects',
      title: 'Projects Section',
      icon: '🚀',
      description: 'Portfolio projects and work',
      color: '#10B981'
    },
    {
      id: 'experience',
      title: 'Experience Section',
      icon: '💼',
      description: 'Work history and achievements',
      color: '#F59E0B'
    },
    {
      id: 'contact',
      title: 'Contact Section',
      icon: '📧',
      description: 'Contact information and form',
      color: '#EF4444'
    },
    {
      id: 'credentials',
      title: 'Credentials Section',
      icon: '🎓',
      description: 'Education and certifications',
      color: '#8B5CF6'
    },
    {
      id: 'media',
      title: 'Media Management',
      icon: '🖼️',
      description: 'Images, videos, and files',
      color: '#EC4899'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="section-content">
            <div className="welcome-header">
              {/* <h2>Welcome back, Admin! 👋</h2> */}
              <p>Here's what's happening with your portfolio today</p>
            </div>
            
            <div className="dashboard-stats">
              <div className="stat-card" style={{ borderLeft: `4px solid ${adminSections[0].color}` }}>
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h4>Total Sections</h4>
                  <p>{adminSections.length}</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${adminSections[1].color}` }}>
                <div className="stat-icon">👁️</div>
                <div className="stat-info">
                  <h4>Portfolio Views</h4>
                  <p>1,247</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${adminSections[2].color}` }}>
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h4>Last Updated</h4>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${adminSections[3].color}` }}>
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <h4>Status</h4>
                  <p className="status-active">Live</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveSection('about')}>
                  <span className="action-icon">✏️</span>
                  Edit About
                </button>
                <button className="action-btn" onClick={() => setActiveSection('projects')}>
                  <span className="action-icon">➕</span>
                  Add Project
                </button>
                <button className="action-btn" onClick={() => setActiveSection('skills')}>
                  <span className="action-icon">🔄</span>
                  Update Skills
                </button>
                <button className="action-btn" onClick={() => setActiveSection('media')}>
                  <span className="action-icon">📁</span>
                  Manage Media
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>About Section Management</h3>
              <p>Update your personal information and bio</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Profile Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="upload-btn" onClick={handleImageUpload}>
                    {selectedImage ? 'Change Image' : 'Upload Image'}
                  </button>
                  {selectedImage && (
                    <img src={selectedImage} alt="Preview" className="image-preview" />
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your full name" className="admin-input" />
              </div>
              
              <div className="form-group">
                <label>Professional Title</label>
                <input type="text" placeholder="e.g., Software Engineer" className="admin-input" />
              </div>
              
              <div className="form-group full-width">
                <label>Professional Bio</label>
                <textarea placeholder="Tell visitors about yourself, your passion, and what drives you..." className="admin-textarea" rows="4"></textarea>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="City, Country" className="admin-input" />
              </div>
              
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" placeholder="5" className="admin-input" min="0" max="50" />
              </div>
            </div>
            
            <div className="form-actions">
              <button className="save-btn">💾 Save Changes</button>
              <button className="cancel-btn">❌ Cancel</button>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Skills Section</h3>
              <p>Manage the skills image and section title</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Skills Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setSkillsImage(URL.createObjectURL(file))
                    }}
                    style={{ display: 'none' }}
                    id="skills-image-input"
                  />
                  <button type="button" className="upload-btn" onClick={() => document.getElementById('skills-image-input').click()}>
                    {skillsImage ? 'Change Image' : 'Upload Image'}
                  </button>
                  {skillsImage && (
                    <img src={skillsImage} alt="Skills Preview" className="image-preview" />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Section Title</label>
                <input type="text" placeholder="e.g., Skills & Tools" className="admin-input" />
              </div>

              <div className="form-actions">
                <button className="save-btn">💾 Save Skills</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Projects Section</h3>
              <p>Add and update your portfolio projects</p>
            </div>
            
            <div className="project-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Type</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input type="radio" name="project-type" />
                      <span>Solo</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="project-type" />
                      <span>Team</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Image</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setProjectImage(URL.createObjectURL(file))
                      }}
                      style={{ display: 'none' }}
                      id="project-image-input"
                    />
                    <button type="button" className="upload-btn" onClick={() => document.getElementById('project-image-input').click()}>
                      {projectImage ? 'Change Image' : 'Upload Image'}
                    </button>
                    {projectImage && (
                      <img src={projectImage} alt="Project Preview" className="image-preview" />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Video URL</label>
                  <input type="url" placeholder="https://... (optional)" className="admin-input" />
                </div>

                <div className="form-group">
                  <label>Project Title</label>
                  <input type="text" placeholder="e.g., E-commerce Platform" className="admin-input" />
                </div>

                <div className="form-group full-width">
                  <label>Project Description</label>
                  <textarea placeholder="Describe your project, its features, and your role..." className="admin-textarea" rows="3"></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Tech Stack</label>
                  <input type="text" placeholder="e.g., React, Vite, Supabase" className="admin-input" />
                </div>

                <div className="form-group full-width">
                  <label>Responsibilities</label>
                  <textarea placeholder="Bullet your responsibilities and contributions" className="admin-textarea" rows="3"></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn">🚀 Add/Update Project</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          </div>
        );
      
      case 'experience':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Experience Section</h3>
              <p>Manage your work history and responsibilities</p>
            </div>
            
            <div className="experience-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Position</label>
                  <input type="text" placeholder="e.g., Senior Software Engineer" className="admin-input" />
                </div>

                <div className="form-group">
                  <label>Company Name & Duration</label>
                  <input type="text" placeholder="e.g., Tech Solutions Inc. (2020-2023)" className="admin-input" />
                </div>

                <div className="form-group full-width">
                  <label>Skills</label>
                  <input type="text" placeholder="e.g., React, Node.js, Leadership" className="admin-input" />
                </div>

                <div className="form-group full-width">
                  <label>About Company</label>
                  <textarea placeholder="Describe the company briefly" className="admin-textarea" rows="2"></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Responsibilities</label>
                  <textarea placeholder="List your responsibilities and achievements" className="admin-textarea" rows="4"></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="save-btn">💼 Save Experience</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Contact Section</h3>
              <p>Manage social media icons and contact title</p>
            </div>
            
            <div className="contact-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Social Media Image</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setContactImage(URL.createObjectURL(file))
                      }}
                      style={{ display: 'none' }}
                      id="contact-image-input"
                    />
                    <button type="button" className="upload-btn" onClick={() => document.getElementById('contact-image-input').click()}>
                      {contactImage ? 'Change Image' : 'Upload Image'}
                    </button>
                    {contactImage && (
                      <img src={contactImage} alt="Social Preview" className="image-preview" />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="e.g., Get in touch" className="admin-input" />
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn">📧 Save Contact</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          </div>
        );
      
      case 'credentials':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Credentials Section</h3>
              <p>Manage courses and certifications</p>
            </div>
            
            <div className="credentials-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Type</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input type="radio" name="credential-type" />
                      <span>Course</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="credential-type" />
                      <span>Certification</span>
                    </label>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea placeholder="Describe the course or certification" className="admin-textarea" rows="3"></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn">🎓 Save Credential</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          </div>
        );
      
      case 'media':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Media Management</h3>
              <p>Upload and organize images, videos, and other media files</p>
            </div>
            
            <div className="media-upload">
              <div className="upload-zone">
                <div className="upload-icon">📁</div>
                <h4>Drag & Drop Files Here</h4>
                <p>or click to browse</p>
                <input type="file" accept="image/*,video/*" multiple className="file-input" />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Media Category</label>
                  <select className="admin-input">
                    <option value="">Select category</option>
                    <option value="profile">Profile Images</option>
                    <option value="projects">Project Screenshots</option>
                    <option value="backgrounds">Background Images</option>
                    <option value="icons">Icons & Logos</option>
                    <option value="gallery">Portfolio Gallery</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tags</label>
                  <input type="text" placeholder="e.g., web, mobile, ui, design" className="admin-input" />
                  <small className="form-help">Separate tags with commas</small>
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea placeholder="Brief description of the media file..." className="admin-textarea" rows="2"></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="save-btn">📤 Upload Media</button>
                <button className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
            
            <div className="media-gallery">
              <h4>Recent Uploads</h4>
              <div className="gallery-grid">
                <div className="media-item">
                  <img src="/images/msJ.png" alt="Profile" className="gallery-image" />
                  <div className="media-overlay">
                    <button className="edit-btn">✏️</button>
                    <button className="delete-btn">🗑️</button>
                  </div>
                </div>
                <div className="media-item">
                  <img src="/images/nightme.png" alt="Background" className="gallery-image" />
                  <div className="media-overlay">
                    <button className="edit-btn">✏️</button>
                    <button className="delete-btn">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Select a section to manage</h3>
              <p>Choose from the sidebar to start managing your portfolio</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <div className="welcome-message">
            <h1 className="admin-title">🎯 Welcome back, Admin!</h1>
            <p className="admin-subtitle">Ready to make your portfolio amazing?</p>
          </div>
          <div className="header-actions">
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              ☰
            </button>
            <button className="notification-btn">🔔</button>
            <button className="profile-btn">👤</button>
          </div>
        </div>
      </div>
      
      <div className="admin-layout">
        <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="admin-nav">
            {adminSections.map((section) => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id);
                  closeMobileMenu();
                }}
                style={{
                  borderLeft: activeSection === section.id ? `4px solid ${section.color}` : '4px solid transparent'
                }}
              >
                <span className="nav-icon">{section.icon}</span>
                <div className="nav-content">
                  <span className="nav-title">{section.title}</span>
                  <span className="nav-description">{section.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div className="mobile-backdrop" onClick={closeMobileMenu}></div>
        )}
        
        <div className="admin-main">
          <div className="admin-content">
            {renderSectionContent()}
          </div>
        </div>
      </div>
      
      <div className="admin-footer">
        <div className="footer-content">
          <p>&copy; 2024 Portfolio Admin Panel | Built with ❤️</p>
          <div className="footer-actions">
            <button className="help-btn">❓ Help</button>
            <button className="logout-btn">🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
