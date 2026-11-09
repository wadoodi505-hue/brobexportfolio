export type PageKey = 'home' | 'about' | 'services' | 'experience' | 'projects' | 'contact';

export type RoutePage = {
  file: string;
  title: string;
  label: string;
  description: string;
  canonicalPath: string;
};

export const routePages: Record<PageKey, RoutePage> = {
  home: {
    file: 'index',
    title: 'BROBEX | Website Developer in Pakistan',
    label: 'Home',
    description: 'BROBEX is a website developer in Pakistan building responsive React, TypeScript and Tailwind CSS websites with thoughtful user experiences.',
    canonicalPath: '/',
  },
  about: {
    file: 'about',
    title: 'About BROBEX | Website Developer',
    label: 'About',
    description: 'Meet BROBEX, a website developer focused on modern frontend engineering, responsive interfaces and practical digital experiences.',
    canonicalPath: '/about',
  },
  services: {
    file: 'services',
    title: 'Web Development Services | BROBEX',
    label: 'Services',
    description: 'Explore BROBEX web development services, including responsive websites, React frontend development, UI implementation and website improvements.',
    canonicalPath: '/services',
  },
  experience: {
    file: 'experience',
    title: 'Development Experience | BROBEX',
    label: 'Experience',
    description: 'Discover the BROBEX development journey, working approach and experience creating responsive websites and modern frontend projects.',
    canonicalPath: '/experience',
  },
  projects: {
    file: 'projects',
    title: 'Web Development Projects | BROBEX',
    label: 'Projects',
    description: 'Explore responsive websites and frontend applications built by BROBEX using React, TypeScript, JavaScript and Tailwind CSS.',
    canonicalPath: '/projects',
  },
  contact: {
    file: 'contact',
    title: 'Hire BROBEX | Web Development',
    label: 'Contact',
    description: 'Contact BROBEX to discuss professional website development, React frontend projects, website redesigns or a custom web application.',
    canonicalPath: '/contact',
  },
};
