import React, { useRef, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './styles/Admin.css';

function Admin() {
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedImage, setSelectedImage] = useState(null);
  const [skillsImage, setSkillsImage] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  const [contactImage, setContactImage] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get the user ID when component mounts
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          console.log('Current user ID:', user.id);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        showMessage('Error getting user authentication. Please log in again.', 'error');
      }
    };
    getUserId();
  }, []);
  
  // Form states for each section
  const [skillsData, setSkillsData] = useState({ title: '' });
  const [projectData, setProjectData] = useState({
    type: '',
    title: '',
    description: '',
    videoUrl: '',
    techStack: '',
    responsibilities: ''
  });
  const [experienceData, setExperienceData] = useState({
    role: '',
    companyDuration: '',
    skills: '',
    about: '',
    responsibilities: ''
  });
  const [credentialsData, setCredentialsData] = useState({
    type: '',
    description: ''
  });
  const [contactData, setContactData] = useState({ title: '' });
  
  // Success/Error messages
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Function to convert data URL to File object
  const dataURLtoFile = async (dataUrl, fileName = 'image.jpg') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  // Function to upload image to Supabase storage
  const uploadImage = async (dataUrl, path) => {
    try {
      const file = await dataURLtoFile(dataUrl);
      const fileExt = file.type.split('/')[1];
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Function to show success/error message
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Skills section save handler
  const handleSkillsSave = async () => {
    try {
      if (!userId) {
        throw new Error('You must be authenticated to perform this action');
      }

      if (!skillsImage || !skillsData.title) {
        throw new Error('Please fill in all required fields');
      }

      const imageUrl = await uploadImage(skillsImage, 'images');

      const { error } = await supabase
        .from('Skills')
        .insert([{
          skill: skillsData.title,
          'image-url': imageUrl,
          user_id: userId
        }]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      showMessage('Skills section saved successfully!');
      
      // Clear form after successful save
      setSkillsImage(null);
      setSkillsData({ title: '' });
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message, 'error');
    }
  };

  // Projects section save handler
  const handleProjectsSave = async () => {
    try {
      if (!projectImage || !projectData.type || !projectData.title || 
          !projectData.description || !projectData.techStack || !projectData.responsibilities) {
        throw new Error('Please fill in all required fields');
      }

      const imageUrl = await uploadImage(projectImage, 'images');

      const { error } = await supabase
        .from('Projects')
        .insert([{
          type: projectData.type,
          'image-url': imageUrl,
          'video-url': projectData.videoUrl,
          description: projectData.description,
          stack: projectData.techStack,
          responsibilities: projectData.responsibilities
        }]);

      if (error) throw error;
      showMessage('Project saved successfully!');
      
      // Clear form after successful save
      setProjectImage(null);
      setProjectData({
        type: '',
        title: '',
        description: '',
        videoUrl: '',
        techStack: '',
        responsibilities: ''
      });
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message, 'error');
    }
  };

  // Experience section save handler
  const handleExperienceSave = async () => {
    try {
      if (!userId) {
        throw new Error('You must be authenticated to perform this action');
      }

      if (!experienceData.role || !experienceData.companyDuration || 
          !experienceData.skills || !experienceData.about || !experienceData.responsibilities) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase
        .from('Experience')
        .insert([{
          role: experienceData.role,
          companyduration: experienceData.companyDuration,
          skills: experienceData.skills,
          about: experienceData.about,
          responsibilities: experienceData.responsibilities,
          user_id: userId
        }]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      showMessage('Experience saved successfully!');
      
      // Clear form after successful save
      setExperienceData({
        role: '',
        companyDuration: '',
        skills: '',
        about: '',
        responsibilities: ''
      });
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message, 'error');
    }
  };

  // Credentials section save handler
  const handleCredentialsSave = async () => {
    try {
      if (!userId) {
        throw new Error('You must be authenticated to perform this action');
      }

      if (!credentialsData.type || !credentialsData.description) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase
        .from('Credentials')
        .insert([{
          type: credentialsData.type,
          description: credentialsData.description,
          user_id: userId
        }]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      showMessage('Credentials saved successfully!');
      
      // Clear form after successful save
      setCredentialsData({
        type: '',
        description: ''
      });
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message, 'error');
    }
  };

  // Contact section save handler
  const handleContactSave = async () => {
    try {
      if (!userId) {
        throw new Error('You must be authenticated to perform this action');
      }

      if (!contactImage || !contactData.title) {
        throw new Error('Please fill in all required fields');
      }

      const imageUrl = await uploadImage(contactImage, 'images');

      const { error } = await supabase
        .from('ContactMedia')
        .insert([{
          'image-url': imageUrl,
          title: contactData.title,
          user_id: userId
        }]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      showMessage('Contact section saved successfully!');
      
      // Clear form after successful save
      setContactImage(null);
      setContactData({ title: '' });
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message, 'error');
    }
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
                <label>Skills Image<span className="required">*</span></label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSkillsImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="skills-image-input"
                    required
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
                <label>Section Title<span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Skills & Tools" 
                  className="admin-input"
                  value={skillsData.title}
                  onChange={(e) => setSkillsData({ ...skillsData, title: e.target.value })}
                  required 
                />
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button className="save-btn" onClick={handleSkillsSave}>💾 Save Skills</button>
                <button className="cancel-btn" onClick={() => {
                  setSkillsImage(null);
                  setSkillsData({ title: '' });
                }}>❌ Cancel</button>
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
                  <label>Project Type<span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="project-type" 
                        value="Solo"
                        checked={projectData.type === 'Solo'}
                        onChange={(e) => setProjectData({ ...projectData, type: e.target.value })}
                        required
                      />
                      <span>Solo</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="project-type" 
                        value="Team"
                        checked={projectData.type === 'Team'}
                        onChange={(e) => setProjectData({ ...projectData, type: e.target.value })}
                        required
                      />
                      <span>Team</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Image<span className="required">*</span></label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProjectImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="project-image-input"
                      required
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
                  <input 
                    type="url" 
                    placeholder="https://... (optional)" 
                    className="admin-input" 
                    value={projectData.videoUrl}
                    onChange={(e) => setProjectData({ ...projectData, videoUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Project Title<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., E-commerce Platform" 
                    className="admin-input"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Project Description<span className="required">*</span></label>
                  <textarea 
                    placeholder="Describe your project, its features, and your role..." 
                    className="admin-textarea" 
                    rows="3"
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Tech Stack<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., React, Vite, Supabase" 
                    className="admin-input"
                    value={projectData.techStack}
                    onChange={(e) => setProjectData({ ...projectData, techStack: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Responsibilities<span className="required">*</span></label>
                  <textarea 
                    placeholder="Bullet your responsibilities and contributions" 
                    className="admin-textarea" 
                    rows="3"
                    value={projectData.responsibilities}
                    onChange={(e) => setProjectData({ ...projectData, responsibilities: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button className="save-btn" onClick={handleProjectsSave}>🚀 Add/Update Project</button>
                <button className="cancel-btn" onClick={() => {
                  setProjectImage(null);
                  setProjectData({
                    type: '',
                    title: '',
                    description: '',
                    videoUrl: '',
                    techStack: '',
                    responsibilities: ''
                  });
                }}>❌ Cancel</button>
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
                  <label>Position<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Senior Software Engineer" 
                    className="admin-input"
                    value={experienceData.role}
                    onChange={(e) => setExperienceData({ ...experienceData, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name & Duration<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Tech Solutions Inc. (2020-2023)" 
                    className="admin-input"
                    value={experienceData.companyDuration}
                    onChange={(e) => setExperienceData({ ...experienceData, companyDuration: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Skills<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., React, Node.js, Leadership" 
                    className="admin-input"
                    value={experienceData.skills}
                    onChange={(e) => setExperienceData({ ...experienceData, skills: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>About Company<span className="required">*</span></label>
                  <textarea 
                    placeholder="Describe the company briefly" 
                    className="admin-textarea" 
                    rows="2"
                    value={experienceData.about}
                    onChange={(e) => setExperienceData({ ...experienceData, about: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Responsibilities<span className="required">*</span></label>
                  <textarea 
                    placeholder="List your responsibilities and achievements" 
                    className="admin-textarea" 
                    rows="4"
                    value={experienceData.responsibilities}
                    onChange={(e) => setExperienceData({ ...experienceData, responsibilities: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="form-actions">
                <button className="save-btn" onClick={handleExperienceSave}>💼 Save Experience</button>
                <button className="cancel-btn" onClick={() => {
                  setExperienceData({
                    role: '',
                    companyDuration: '',
                    skills: '',
                    about: '',
                    responsibilities: ''
                  });
                }}>❌ Cancel</button>
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
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setContactImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
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
                  <label>Type<span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="credential-type" 
                        value="Course"
                        checked={credentialsData.type === 'Course'}
                        onChange={(e) => setCredentialsData({ ...credentialsData, type: e.target.value })}
                        required
                      />
                      <span>Course</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="credential-type" 
                        value="Certification"
                        checked={credentialsData.type === 'Certification'}
                        onChange={(e) => setCredentialsData({ ...credentialsData, type: e.target.value })}
                        required
                      />
                      <span>Certification</span>
                    </label>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description<span className="required">*</span></label>
                  <textarea 
                    placeholder="Describe the course or certification" 
                    className="admin-textarea" 
                    rows="3"
                    value={credentialsData.description}
                    onChange={(e) => setCredentialsData({ ...credentialsData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button className="save-btn" onClick={handleCredentialsSave}>🎓 Save Credential</button>
                <button className="cancel-btn" onClick={() => {
                  setCredentialsData({
                    type: '',
                    description: ''
                  });
                }}>❌ Cancel</button>
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
