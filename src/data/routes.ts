export type PageKey = 'home' | 'about' | 'services' | 'experience' | 'projects' | 'contact';
export const routePages: Record<PageKey, { file: string; title: string; label: string }> = {
  home: { file: 'index', title: 'BROBEX | Freelance Web Developer', label: 'Home' },
  about: { file: 'about', title: 'About BROBEX | Digital Architect & Frontend Developer', label: 'About' },
  services: { file: 'services', title: 'Services | BROBEX Frontend Development', label: 'Services' },
  experience: { file: 'experience', title: 'Experience | BROBEX Development Journey', label: 'Experience' },
  projects: { file: 'projects', title: 'Projects | BROBEX Frontend Portfolio', label: 'Projects' },
  contact: { file: 'contact', title: 'Contact | Start a BROBEX Project', label: 'Contact' },
};
