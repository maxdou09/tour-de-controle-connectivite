#!/usr/bin/env node

/**
 * Script automatisé de redéploiement
 * Utilise l'API GitHub directement pour créer/mettre à jour le repo
 * Sans besoin de Git binaire
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_OWNER = 'Maxtra09';
const GITHUB_REPO = 'tour-de-controle-connectivite';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

console.log(`
╔══════════════════════════════════════════════════════╗
║  🚀 REDÉPLOIEMENT AUTOMATISÉ COMPLET                ║
║  Tour de Contrôle Connectivité                      ║
╚══════════════════════════════════════════════════════╝
`);

if (!GITHUB_TOKEN) {
    console.error(`
❌ Token GitHub manquant !

Usage:
  node auto-deploy.mjs YOUR_GITHUB_TOKEN

Ou via variable d'environnement:
  $env:GITHUB_TOKEN = "ghp_xxxxx"
  node auto-deploy.mjs
    `);
    process.exit(1);
}

console.log(`📋 Configuration:`);
console.log(`   Owner: ${GITHUB_OWNER}`);
console.log(`   Repo: ${GITHUB_REPO}`);
console.log(`   Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
console.log('');

// Fonctions API
function httpRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Auto-Deploy-Script',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        if (data) {
            const payload = JSON.stringify(data);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => { responseData += chunk; });
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
                    }
                } catch (e) {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Main function
async function main() {
    try {
        // ÉTAPE 1 : Vérifier/créer le repo
        console.log('📝 Étape 1 : Vérification/Création du repo GitHub...');
        
        try {
            await httpRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
            console.log('   ✅ Repo existe déjà');
        } catch (e) {
            console.log('   🆕 Création du repo...');
            await httpRequest('POST', '/user/repos', {
                name: GITHUB_REPO,
                description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                private: false,
                auto_init: false
            });
            console.log('   ✅ Repo créé');
        }

        // ÉTAPE 2 : Récupérer les fichiers du projet
        console.log('');
        console.log('📝 Étape 2 : Lecture des fichiers du projet...');
        
        const projectDir = process.cwd();
        const files = [];
        
        function walk(dir) {
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                if (['node_modules', '.git', 'dist', '.env', '.DS_Store', 'npm_install_verbose.log'].includes(entry)) continue;
                if (entry.startsWith('.') && entry !== '.gitignore' && entry !== '.npmrc' && entry !== '.vercelignore') continue;
                
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else {
                    const relativePath = path.relative(projectDir, fullPath).replace(/\\/g, '/');
                    files.push(relativePath);
                }
            }
        }
        
        walk(projectDir);
        console.log(`   ✅ ${files.length} fichiers trouvés`);

        // ÉTAPE 3 : Upload les fichiers
        console.log('');
        console.log('📝 Étape 3 : Upload des fichiers vers GitHub...');
        
        let uploaded = 0;
        let updated = 0;
        let skipped = 0;

        for (const file of files) {
            try {
                const filePath = path.join(projectDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const base64Content = Buffer.from(content).toString('base64');

                // Récupérer le SHA existant
                let sha = undefined;
                try {
                    const existing = await httpRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`);
                    sha = existing.sha;
                } catch (e) {
                    // Fichier n'existe pas, c'est ok
                }

                // Upload/Update le fichier
                await httpRequest('PUT', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`, {
                    message: `${sha ? 'update' : 'add'}: ${file}`,
                    content: base64Content,
                    ...(sha && { sha })
                });

                if (sha) {
                    console.log(`   ✅ ${file} (mis à jour)`);
                    updated++;
                } else {
                    console.log(`   ✅ ${file} (créé)`);
                    uploaded++;
                }
            } catch (error) {
                if (error.message.includes('422')) {
                    console.log(`   ⚠️  ${file} (fichier volumineux, skippé)`);
                    skipped++;
                } else {
                    console.log(`   ❌ ${file} : ${error.message}`);
                }
            }
        }

        console.log('');
        console.log(`📊 Résultats:`);
        console.log(`   ✅ Créés: ${uploaded}`);
        console.log(`   ✅ Mis à jour: ${updated}`);
        if (skipped > 0) console.log(`   ⚠️  Skippés: ${skipped}`);

        // Résumé final
        console.log('');
        console.log(`
╔══════════════════════════════════════════════════════╗
║  ✨ REDÉPLOIEMENT RÉUSSI !                          ║
╚══════════════════════════════════════════════════════╝

📍 GitHub Repository:
   https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}

📊 Statistiques:
   Fichiers uploadés: ${uploaded}
   Fichiers mis à jour: ${updated}
   Fichiers skippés: ${skipped}
   Total: ${files.length}

🔄 Prochaines étapes:
   1. Vérifiez: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}
   2. Configurer Vercel: https://vercel.com/new
   3. Importer le repo
   4. Cliquer "Deploy"

✨ Votre projet est maintenant sur GitHub !
        `);

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

main();
