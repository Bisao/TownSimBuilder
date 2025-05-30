
// Pages
export { default as HomePage } from './home';
export { default as GamePage } from './game';
export { default as SettingsPage } from './settings';
export { default as HelpPage } from './help';
export { default as NotFoundPage } from './not-found';

// Page Types
export interface PageProps {
  className?: string;
}

// Page Routes
export const PAGE_ROUTES = {
  HOME: '/',
  GAME: '/game',
  SETTINGS: '/settings',
  HELP: '/help',
  NOT_FOUND: '/404',
} as const;

// Page Metadata
export const PAGE_METADATA = {
  [PAGE_ROUTES.HOME]: {
    title: 'Medieval Sim - Início',
    description: 'Construa sua aldeia medieval'
  },
  [PAGE_ROUTES.GAME]: {
    title: 'Medieval Sim - Jogo',
    description: 'Jogando Medieval Sim'
  },
  [PAGE_ROUTES.SETTINGS]: {
    title: 'Medieval Sim - Configurações',
    description: 'Configurações do jogo'
  },
  [PAGE_ROUTES.HELP]: {
    title: 'Medieval Sim - Ajuda',
    description: 'Tutorial e ajuda'
  },
  [PAGE_ROUTES.NOT_FOUND]: {
    title: 'Medieval Sim - Página Não Encontrada',
    description: 'Página não encontrada'
  }
} as const;
