export interface ChangelogItem {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'improvement' | 'catalog';
}

export const changelogData: ChangelogItem[] = [
  {
    id: '1',
    version: '1.2.0',
    date: '2025-01-20',
    title: 'Lançamento do App Mobile & Novidades',
    description: 'Agora você pode baixar o APK oficial do Animax! Além disso, adicionamos um novo carrossel na página inicial, uma seção de episódios recentes de animes e este sistema de notificações.',
    type: 'feature'
  },
  {
    id: '2',
    version: '1.1.5',
    date: '2025-01-20',
    title: 'Otimização do Player',
    description: 'Remoção de restrições (sandbox) no player de vídeo para garantir maior compatibilidade e carregamento mais rápido dos conteúdos.',
    type: 'improvement'
  },
  {
    id: '3',
    version: '1.1.0',
    date: '2025-01-19',
    title: 'Carrossel Dinâmico',
    description: 'A página inicial agora conta com um carrossel rotativo automático exibindo os filmes e séries mais populares do momento.',
    type: 'feature'
  },
  {
    id: '4',
    version: '1.0.5',
    date: '2025-01-19',
    title: 'Correções de Domínio e DNS',
    description: 'Ajustes na configuração do domínio animax.click para garantir acesso estável e correção de conflitos de DNS.',
    type: 'fix'
  }
];
