#!/usr/bin/env node

/**
 * Script para melhorar imagem usando APIs de IA
 *
 * APIs Gratuitas disponíveis:
 * 1. Replicate AI (free tier)
 * 2. DeepAI
 * 3. Stability AI
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuração
const IMAGE_PATH = path.join(__dirname, '../public/images/casa1.jpg');
const OUTPUT_PATH = path.join(__dirname, '../public/images/casa1-enhanced.jpg');

console.log('🎨 Melhorador de Imagem com IA\n');

// Opção 1: DeepAI (Grátis, sem cadastro)
async function enhanceWithDeepAI() {
  console.log('📡 Usando DeepAI Super Resolution...\n');

  const FormData = require('form-data');
  const form = new FormData();

  form.append('image', fs.createReadStream(IMAGE_PATH));

  const options = {
    method: 'POST',
    hostname: 'api.deepai.org',
    path: '/api/torch-srgan',
    headers: {
      ...form.getHeaders(),
      'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K' // API key pública de demonstração
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Imagem processada!');
          console.log('🔗 URL:', result.output_url);

          // Download da imagem melhorada
          downloadImage(result.output_url, OUTPUT_PATH)
            .then(() => {
              console.log('💾 Imagem salva em:', OUTPUT_PATH);
              console.log('\n✨ Processo concluído!');
              console.log('📋 Próximos passos:');
              console.log('1. Verifique a imagem em: public/images/casa1-enhanced.jpg');
              console.log('2. Se gostar, substitua: mv casa1-enhanced.jpg casa1.jpg');
              console.log('3. Limpe o cache: rm -rf .next && npm run dev');
              resolve();
            });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

// Download da imagem
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', reject);
    });
  });
}

// Opção 2: Guia de uso manual
function showManualGuide() {
  console.log('📖 GUIA RÁPIDO - Melhorar Imagem Online:\n');
  console.log('1️⃣  Acesse: https://www.upscale.media/');
  console.log('2️⃣  Arraste: public/images/casa1.jpg');
  console.log('3️⃣  Clique: "Upscale Image"');
  console.log('4️⃣  Download da imagem melhorada');
  console.log('5️⃣  Substitua o arquivo original\n');

  console.log('🎯 ALTERNATIVAS:');
  console.log('• Upscayl (app Mac): https://upscayl.github.io/');
  console.log('• Let\'s Enhance: https://letsenhance.io/');
  console.log('• Deep AI: https://deepai.org/machine-learning-model/torch-srgan\n');
}

// Execução
if (require.main === module) {
  // Verificar se form-data está instalado
  try {
    require('form-data');
    enhanceWithDeepAI().catch(error => {
      console.error('❌ Erro:', error.message);
      console.log('\n📌 Use o guia manual:\n');
      showManualGuide();
    });
  } catch (e) {
    console.log('⚠️  Dependência "form-data" não encontrada.');
    console.log('📦 Instalando...\n');

    const { execSync } = require('child_process');
    try {
      execSync('npm install form-data', { stdio: 'inherit' });
      console.log('\n✅ Instalado! Execute novamente: node scripts/enhance-image.js\n');
    } catch (err) {
      console.log('\n📌 Use o guia manual:\n');
      showManualGuide();
    }
  }
}

module.exports = { enhanceWithDeepAI, downloadImage };
