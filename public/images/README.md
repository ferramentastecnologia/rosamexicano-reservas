# Como Adicionar Fotos do Restaurante

## Fotos recomendadas

Para melhorar a landing page, adicione fotos do restaurante nesta pasta:

### 1. Logo
- **Nome do arquivo**: `logo_mortadella_branco.png`
- **Descrição**: Logo branco do Mortadella
- **Onde encontrar**: http://www.mortadella.com.br/images/logo_mortadella_branco.png

### 2. Fotos do ambiente
Adicione fotos do interior do restaurante, mesas decoradas, etc:
- `ambiente-1.jpg`
- `ambiente-2.jpg`
- `ambiente-3.jpg`

### 3. Fotos de pratos
Para mostrar a qualidade da comida:
- `prato-1.jpg`
- `prato-2.jpg`
- `prato-3.jpg`

### 4. Fotos de confraternizações anteriores
Se tiver fotos de eventos anteriores:
- `evento-1.jpg`
- `evento-2.jpg`

## Como usar as fotos no projeto

Depois de adicionar as fotos aqui, você pode usá-las no código assim:

```tsx
import Image from 'next/image';

<Image
  src="/images/logo_mortadella_branco.png"
  alt="Mortadella Logo"
  width={200}
  height={50}
/>
```

## Otimização

Para melhor performance:
- Use formatos modernos (WebP, AVIF)
- Comprima as imagens antes de adicionar
- Tamanho recomendado: até 500KB por imagem
- Resolução recomendada: 1920x1080 para banners, 800x600 para cards

## Ferramentas de compressão

- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app
- ImageOptim (Mac): https://imageoptim.com
