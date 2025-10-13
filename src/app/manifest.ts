import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aura - Phụ kiện thời trang nam nữ giá rẻ',
    short_name: 'Aura',
    description: 'Cửa hàng phụ kiện thời trang với giá cả phải chăng, phù hợp cho học sinh sinh viên',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
