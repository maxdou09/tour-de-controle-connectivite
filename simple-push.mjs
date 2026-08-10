#!/usr/bin/env node

/**
 * Push simplifié via l'API GitHub
 * Crée directement les fichiers via l'API (plus fiable)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = 'Maxtra09';
const REPO = 'tour-de-controle-connectivite';
const TOKEN = process.env.GITHUB_TOKEN;

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 PUSH VIA API GITHUB DIRECTE                          ║
║  Tour de Contrôle → ${OWNER}/${REPO}                      ║
╚════════════════════════════════════════════════════════════╝
`);

if (!TOKEN) {
    console.error('❌ Token GITHUB_TOKEN manquant');
    process.exit(1);
}

function apiRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`https://api.github.com${endpoint}`);
        
        const options = {
            method,
            hostname: 'api.github.com',
            path: endpoint,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'Deploy-Script',
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        };

        if (body) {
            const payload = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const status = res.statusCode;
                if (status >= 200 && status < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : {});
                    } catch (e) {
                        resolve({});
                    }
                } else {
                    try {
                        const error = JSON.parse(data);
                        reject(new Error(`HTTP ${status}: ${error.message || error}`));
                    } catch (e) {
                        reject(new Error(`HTTP ${status}: ${data}`));
                    }
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    try {
        console.log('📝 Étape 1 : Vérification du repo...');
        try {
            const repo = await apiRequest('GET', `/repos/${OWNER}/${REPO}`);
            console.log('   ✅ Repo existe');
        } catch (e) {
            if (e.message.includes('404')) {
                console.log('   Création du repo...');
                try {
                    await apiRequest('POST', '/user/repos', {
                        name: REPO,
                        description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                        private: false
                    });
                    console.log('   ✅ Repo créé');
                    await new Promise(r => setTimeout(r, 2000));
                } catch (createErr) {
                    console.log('   ⚠️  Création échouée, continuons...');
                }
            }
        }

        console.log('\n📝 Étape 2 : Scan des fichiers...');
        const files = [];
        const ignore = ['node_modules', '.git', 'dist', '.env', '.DS_Store', 'npm_install_verbose.log'];

        function walk(dir) {
            try {
                const entries = fs.readdirSync(dir);
                for (const entry of entries) {
                    if (ignore.includes(entry)) continue;
                    
                    const full = path.join(dir, entry);
                    const stat = fs.statSync(full);
                    const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
                    
                    if (stat.isDirectory()) {
                        walk(full);
                    } else {
                        files.push(rel);
                    }
                }
            } catch (e) {
                // Ignore read errors
            }
        }

        walk(process.cwd());
        console.log(`   ✅ ${files.length} fichiers trouvés`);

        console.log('\n📝 Étape 3 : Upload des fichiers via API...');
        let success = 0;
        let failed = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const fullPath = path.join(process.cwd(), file);
                const content = fs.readFileSync(fullPath, 'utf-8');
                const base64 = Buffer.from(content).toString('base64');

                // Récupérer SHA existant si le fichier existe
                let sha = null;
                try {
                    const existing = await apiRequest('GET', 
                        `/repos/${OWNER}/${REPO}/contents/${file}`);
                    sha = existing.sha;
                } catch (e) {
                    // Fichier n'existe pas, c'est ok
                }

                // Upload
                await apiRequest('PUT', 
                    `/repos/${OWNER}/${REPO}/contents/${file}`,
                    {
                        message: `chore: ${sha ? 'update' : 'add'} ${file}`,
                        content: base64,
                        ...(sha && { sha })
                    }
                );

                success++;
                if (success % 5 === 0) {
                    console.log(`   ✅ ${success}/${files.length} fichiers uploadés...`);
                }
            } catch (error) {
                failed++;
                if (failed <= 3) {
                    console.log(`   ⚠️  ${file}: ${error.message.substring(0, 50)}`);
                }
            }
        }

        console.log(`\n📝 Étape 4 : Vérification finale...`);
        try {
            const contents = await apiRequest('GET', 
                `/repos/${OWNER}/${REPO}/contents`);
            const fileCount = Array.isArray(contents) ? contents.length : 0;
            console.log(`   ✅ ${fileCount} fichiers visible sur GitHub`);
        } catch (e) {
            console.log(`   ℹ️  Vérification: ${e.message}`);
        }

        console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✨ PUSH COMPLÉTÉ !                                       ║
╚════════════════════════════════════════════════════════════╝

📍 Repository GitHub:
   https://github.com/${OWNER}/${REPO}

📊 Résumé:
   ✅ Uploadés : ${success}/${files.length}
   ⚠️  Erreurs : ${failed}

🔗 LIENS:
   Repo     : https://github.com/${OWNER}/${REPO}
   Fichiers : https://github.com/${OWNER}/${REPO}/tree/main

🎯 PROCHAINES ÉTAPES:
   1. Vérifiez le repo sur GitHub
   2. Allez sur https://vercel.com/new
   3. Cliquez "Import Repository"
   4. Sélectionnez tour-de-controle-connectivite
   5. Cliquez "Deploy"
   6. Attendez 2-3 minutes
   7. C'EST FINI ! 🎉

✨ Votre projet est sur GitHub et prêt pour Vercel !
        `);

    } catch (error) {
        console.error(`\n❌ ERREUR: ${error.message}`);
        process.exit(1);
    }
}

main();
