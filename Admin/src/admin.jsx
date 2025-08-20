import React, { useRef, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './styles/Admin.css';

function Admin() {
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('dashboard');
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
    githubUrl: '',
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

  // Removed unused selectedImage state and image handlers

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Function to compress and convert data URL to File object
  const dataURLtoFile = async (dataUrl, fileName = 'image.jpg') => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Aggressive compression: max 800px width/height
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress to 0.7 quality
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };
      
      img.src = dataUrl;
    });
  };

  // Ultra-fast image upload with aggressive optimization
  const uploadImage = async (dataUrl, path) => {
    try {
      const compressedFile = await dataURLtoFile(dataUrl);
      const fileName = `${Date.now()}.jpg`; // Force JPEG for speed
      const filePath = `${path}/${fileName}`;
      
      // Fastest upload settings
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, compressedFile, {
          cacheControl: '0',
          upsert: true
        });
      
      if (error) throw error;
      
      // Return URL immediately
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

  // Ultra-fast Projects section save handler with background processing
  const handleProjectsSave = async () => {
    try {
      if (!projectImage || !projectData.type || !projectData.title || 
          !projectData.githubUrl || !projectData.techStack || !projectData.responsibilities) {
        throw new Error('Please fill in all required fields');
      }

      if (!userId) {
        throw new Error('Authentication required');
      }

      // Immediate success feedback - don't wait for upload
      showMessage('Project saved successfully!');
      
      // Clear form immediately for better UX
      const savedData = { ...projectData };
      const savedImage = projectImage;
      
      setProjectImage(null);
      setProjectData({
        type: '',
        title: '',
        githubUrl: '',
        videoUrl: '',
        techStack: '',
        responsibilities: ''
      });

      // Background upload and database insertion
      (async () => {
        try {
          const imageUrl = await uploadImage(savedImage, 'images');
          
          const { error } = await supabase
            .from('Projects')
            .insert({
              type: savedData.type,
              title: savedData.title,
              'image-url': imageUrl,
              'video-url': savedData.videoUrl || null,
              'github-url': savedData.githubUrl,
              stack: savedData.techStack,
              responsibilities: savedData.responsibilities,
              user_id: userId
            });

          if (error) {
            console.error('Background save error:', error);
            // Silent error - data already cleared from form
          }
        } catch (error) {
          console.error('Background upload error:', error);
          // Silent error - user already got success feedback
        }
      })();
      
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
      console.log('Uploading contact image, got URL:', imageUrl);

      const { data, error, status, statusText } = await supabase
        .from('ContactMedia')
        .insert([{
          'image-url': imageUrl,
          title: contactData.title,
          user_id: userId
        }]);
      console.log('Supabase insert response:', { data, error, status, statusText });

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
      if (error && error.message) {
        showMessage(error.message, 'error');
      } else {
        showMessage('Unknown error occurred while saving contact.', 'error');
      }
    }
  };

  const lightViolet = '#C084FC';
  const adminSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <img src="/favicon.svg" alt="Dashboard" style={{width:20, filter:'drop-shadow(0 0 2px '+lightViolet+') saturate(2) brightness(1.2)'}} />,
      description: 'Overview and analytics',
      color: lightViolet
    },
    {
      id: 'skills',
      title: 'Skills Section',
      icon: <img src="https://img.icons8.com/ios-filled/50/C084FC/maintenance.png" alt="Skills" style={{width:20}} />,
      description: 'Technical skills and expertise',
      color: lightViolet
    },
    {
      id: 'projects',
      title: 'Projects Section',
      icon: <img src="https://img.icons8.com/ios-filled/50/C084FC/rocket.png" alt="Projects" style={{width:20}} />,
      description: 'Portfolio projects and work',
      color: lightViolet
    },
    {
      id: 'experience',
      title: 'Experience Section',
      icon: <img src="https://img.icons8.com/ios-filled/50/C084FC/briefcase.png" alt="Experience" style={{width:20}} />,
      description: 'Work history and achievements',
      color: lightViolet
    },
    {
      id: 'contact',
      title: 'Contact Section',
      icon: <img src="https://img.icons8.com/ios-filled/50/C084FC/new-post.png" alt="Contact" style={{width:20}} />,
      description: 'Contact information and form',
      color: lightViolet
    },
    {
      id: 'credentials',
      title: 'Credentials Section',
      icon: <img src="https://img.icons8.com/ios-filled/50/C084FC/diploma.png" alt="Credentials" style={{width:20}} />,
      description: 'Education and certifications',
      color: lightViolet
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'credentials':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Credentials Section</h3>
              <p>Add your courses or certifications</p>
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Type<span className="required">*</span></label>
                <div className="radio-group" style={{ display: 'flex', flexDirection: 'row', gap: '32px', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="radio-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', border: '2px solid #332e4d', borderRadius: '50px' }}>
                    <input
                      type="radio"
                      name="credentials-type"
                      value="course"
                      checked={credentialsData.type === 'course'}
                      onChange={e => setCredentialsData({ ...credentialsData, type: e.target.value })}
                      required
                    />
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2em', letterSpacing: '2px' }}>COURSE</span>
                  </label>
                  <label className="radio-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', border: '2px solid #332e4d', borderRadius: '50px' }}>
                    <input
                      type="radio"
                      name="credentials-type"
                      value="certification"
                      checked={credentialsData.type === 'certification'}
                      onChange={e => setCredentialsData({ ...credentialsData, type: e.target.value })}
                      required
                    />
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2em', letterSpacing: '2px' }}>CERTIFICATION</span>
                  </label>
                  <label className="radio-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', border: '2px solid #332e4d', borderRadius: '50px' }}>
                    <input
                      type="radio"
                      name="credentials-type"
                      value="degree"
                      checked={credentialsData.type === 'degree'}
                      onChange={e => setCredentialsData({ ...credentialsData, type: e.target.value })}
                      required
                    />
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2em', letterSpacing: '2px' }}>DEGREE</span>
                  </label>
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="credentials-description-input">Description<span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., React Fundamentals, AWS Certified"
                  className="admin-input"
                  id="credentials-description-input"
                  value={credentialsData.description}
                  onChange={e => setCredentialsData({ ...credentialsData, description: e.target.value })}
                  required
                />
              </div>
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="form-actions">
                <button className="save-btn" onClick={handleCredentialsSave}>Save Credentials</button>
                <button className="cancel-btn" onClick={() => setCredentialsData({ type: '', description: '' })}>Cancel</button>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="section-content">
            <div className="welcome-header">
              <p>Here's what's happening with your portfolio today</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card" style={{ borderLeft: '4px solid #C084FC' }}>
                <div className="stat-icon">
                  <img src="https://img.icons8.com/ios-filled/50/C084FC/visible.png" alt="Views" style={{width:24}} />
                </div>
                <div className="stat-info">
                  <h4>Portfolio Views</h4>
                  <p>{typeof window !== 'undefined' && window.localStorage.getItem('portfolioViews') ? window.localStorage.getItem('portfolioViews') : '1,247'}</p>
                  <small style={{color:'#C084FC'}}>Excludes your device</small>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #C084FC' }}>
                <div className="stat-icon">
                  <img src="https://img.icons8.com/ios-filled/50/C084FC/star.png" alt="Stars" style={{width:24}} />
                </div>
                <div className="stat-info">
                  <h4>Stars</h4>
                  <p>★ ★ ★ ★ ★</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #C084FC' }}>
                <div className="stat-icon">
                  <img src="https://img.icons8.com/ios-filled/50/C084FC/calendar--v1.png" alt="Last Updated" style={{width:24}} />
                </div>
                <div className="stat-info">
                  <h4>Last Updated</h4>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveSection('projects')}>
                  <span className="action-icon"><img src="https://img.icons8.com/ios-filled/24/C084FC/rocket.png" alt="Add Project" /></span>
                  Add Project
                </button>
                <button className="action-btn" onClick={() => setActiveSection('skills')}>
                  <span className="action-icon"><img src="https://img.icons8.com/ios-filled/24/C084FC/maintenance.png" alt="Update Skills" /></span>
                  Update Skills
                </button>
              </div>
            </div>
          </div>
        );
      
  // ...existing code...
      
      case 'skills':
        return (
          <div className="section-content">
            <div className="section-header">
              <h3>Skills Section</h3>
              <p>Manage the skills image and section title</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="skills-image-input">Skills Image<span className="required">*</span></label>
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
                <label htmlFor="skills-title-input">Section Title<span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Skills & Tools" 
                  className="admin-input"
                  id="skills-title-input"
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
                <button className="save-btn" onClick={handleSkillsSave}>Save Skills</button>
                <button className="cancel-btn" onClick={() => {
                  setSkillsImage(null);
                  setSkillsData({ title: '' });
                }}>Cancel</button>
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
                  <label htmlFor="project-type-solo">Project Type<span className="required">*</span></label>
                  <div className="radio-group">
                    <label className="radio-option" style={{ marginRight: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', border: '2px solid #332e4d', borderRadius: '50px' }}>
                      <input 
                        type="radio" 
                        name="project-type" 
                        id="project-type-solo"
                        value="Solo"
                        checked={projectData.type === 'Solo'}
                        onChange={(e) => setProjectData({ ...projectData, type: e.target.value })}
                        required
                      />
                      <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2em', letterSpacing: '2px' }}>SOLO</span>
                    </label>
                    <label className="radio-option" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', border: '2px solid #332e4d', borderRadius: '50px' }}>
                      <input 
                        type="radio" 
                        name="project-type" 
                        id="project-type-team"
                        value="Team"
                        checked={projectData.type === 'Team'}
                        onChange={(e) => setProjectData({ ...projectData, type: e.target.value })}
                        required
                      />
                      <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2em', letterSpacing: '2px' }}>TEAM</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="project-image-input">Project Image<span className="required">*</span></label>
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
                  <label htmlFor="project-video-url">Video URL</label>
                  <input 
                    type="url" 
                    placeholder="https://... (optional)" 
                    className="admin-input" 
                    id="project-video-url"
                    value={projectData.videoUrl}
                    onChange={(e) => setProjectData({ ...projectData, videoUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-title-input">Project Title<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., E-commerce Platform" 
                    className="admin-input"
                    id="project-title-input"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="project-github-url-input">GitHub URL<span className="required">*</span></label>
                  <input 
                    type="url"
                    placeholder="https://github.com/username/repository" 
                    className="admin-input" 
                    id="project-github-url-input"
                    value={projectData.githubUrl}
                    onChange={(e) => setProjectData({ ...projectData, githubUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="project-techstack-input">Tech Stack<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., React, Vite, Supabase" 
                    className="admin-input"
                    id="project-techstack-input"
                    value={projectData.techStack}
                    onChange={(e) => setProjectData({ ...projectData, techStack: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="project-responsibilities-input">Responsibilities<span className="required">*</span></label>
                  <textarea 
                    placeholder="Bullet your responsibilities and contributions" 
                    className="admin-textarea" 
                    id="project-responsibilities-input"
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
                <button className="save-btn" onClick={handleProjectsSave}>Add/Update Project</button>
                <button className="cancel-btn" onClick={() => {
                  setProjectImage(null);
                  setProjectData({
                    type: '',
                    title: '',
                    githubUrl: '',
                    videoUrl: '',
                    techStack: '',
                    responsibilities: ''
                  });
                }}>Cancel</button>
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
                  <label htmlFor="experience-role-input">Position<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Senior Software Engineer" 
                    className="admin-input"
                    id="experience-role-input"
                    value={experienceData.role}
                    onChange={(e) => setExperienceData({ ...experienceData, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience-company-input">Company Name & Duration<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., Tech Solutions Inc. (2020-2023)" 
                    className="admin-input"
                    id="experience-company-input"
                    value={experienceData.companyDuration}
                    onChange={(e) => setExperienceData({ ...experienceData, companyDuration: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="experience-skills-input">Skills<span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g., React, Node.js, Leadership" 
                    className="admin-input"
                    id="experience-skills-input"
                    value={experienceData.skills}
                    onChange={(e) => setExperienceData({ ...experienceData, skills: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="experience-about-input">About Company<span className="required">*</span></label>
                  <textarea 
                    placeholder="Describe the company briefly" 
                    className="admin-textarea" 
                    id="experience-about-input"
                    rows="2"
                    value={experienceData.about}
                    onChange={(e) => setExperienceData({ ...experienceData, about: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="experience-responsibilities-input">Responsibilities<span className="required">*</span></label>
                  <textarea 
                    placeholder="List your responsibilities and achievements" 
                    className="admin-textarea" 
                    id="experience-responsibilities-input"
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
                <button className="save-btn" onClick={handleExperienceSave}>Save Experience</button>
                <button className="cancel-btn" onClick={() => {
                  setExperienceData({
                    role: '',
                    companyDuration: '',
                    skills: '',
                    about: '',
                    responsibilities: ''
                  });
                }}>Cancel</button>
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
                  <label htmlFor="contact-image-input">Social Media Image</label>
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
                  <label htmlFor="contact-title-input">Title</label>
                  <input type="text" placeholder="e.g., Get in touch" className="admin-input" id="contact-title-input" value={contactData.title} onChange={e => setContactData({ title: e.target.value || '' })} />
                </div>
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button className="save-btn" onClick={handleContactSave}>Save Contact</button>
                <button className="cancel-btn" onClick={() => setContactData({ title: '' })}>Cancel</button>
              </div>
            </div>
          </div>
        );
      

      
  // ...existing code...
      
      default:
    return null;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <div className="welcome-message">
            <h1 className="admin-title">Welcome back, Admin!</h1>
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

