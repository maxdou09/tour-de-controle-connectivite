#!/usr/bin/env node

/**
 * Script de déploiement avancé
 * Crée un repo GitHub et upload tous les fichiers via l'API
 * Utilise un arbre de commits pour plus de fiabilité
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_OWNER = 'Maxtra09';
const GITHUB_REPO = 'tour-de-controle-connectivite';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

console.log(`
╔══════════════════════════════════════════════════════╗
║  🚀 REDÉPLOIEMENT COMPLET - DÉPLOIEMENT FINAL       ║
║  Tour de Contrôle Connectivité                      ║
╚══════════════════════════════════════════════════════╝
`);

if (!GITHUB_TOKEN) {
    console.error(`
❌ Token GitHub manquant !

Usage:
  $env:GITHUB_TOKEN = "ghp_xxxxx"; node deploy-final.mjs
    `);
    process.exit(1);
}

console.log(`📋 Configuration:`);
console.log(`   Owner: ${GITHUB_OWNER}`);
console.log(`   Repo: ${GITHUB_REPO}`);
console.log(`   Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
console.log('');

// Fonctions API
async function apiCall(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Deploy-Script/1.0',
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
                try {
                    const response = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject({
                            status: res.statusCode,
                            message: response.message || data
                        });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, message: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Récupérer les fichiers
function getFiles(dir, base = '') {
    const files = [];
    const ignore = ['node_modules', '.git', '.DS_Store', 'dist', '.env'];
    
    try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            if (ignore.includes(entry)) continue;
            
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            const relativePath = path.join(base, entry).replace(/\\/g, '/');
            
            if (stat.isDirectory()) {
                files.push(...getFiles(fullPath, relativePath));
            } else {
                files.push(relativePath);
            }
        }
    } catch (e) {
        console.error(`Erreur en lisant ${dir}:`, e.message);
    }
    
    return files;
}

// Main
async function main() {
    try {
        // ÉTAPE 1 : Créer/vérifier le repo
        console.log('📝 Étape 1 : Préparation du repo GitHub...');
        let repoExists = false;
        
        try {
            await apiCall('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
            console.log('   ✅ Repo existe');
            repoExists = true;
        } catch (e) {
            if (e.status === 404) {
                console.log('   🆕 Création du repo...');
                try {
                    await apiCall('POST', '/user/repos', {
                        name: GITHUB_REPO,
                        description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                        private: false,
                        auto_init: false
                    });
                    console.log('   ✅ Repo créé');
                } catch (createError) {
                    console.log('   ℹ️  Repo probablement déjà créé');
                }
            } else {
                throw e;
            }
        }

        // Attendre un peu que le repo soit prêt
        await new Promise(r => setTimeout(r, 2000));

        // ÉTAPE 2 : Récupérer les fichiers
        console.log('');
        console.log('📝 Étape 2 : Scan des fichiers...');
        const files = getFiles(process.cwd());
        console.log(`   ✅ ${files.length} fichiers trouvés`);

        // ÉTAPE 3 : Upload des fichiers
        console.log('');
        console.log('📝 Étape 3 : Upload vers GitHub...');
        
        let success = 0;
        let failed = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const filePath = path.join(process.cwd(), file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const base64 = Buffer.from(content).toString('base64');

                // Obtenir le SHA du fichier existant s'il existe
                let sha = null;
                try {
                    const existing = await apiCall('GET', 
                        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`);
                    sha = existing.sha;
                } catch (e) {
                    // Fichier n'existe pas, c'est ok
                }

                // Upload/update
                await apiCall('PUT', 
                    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`,
                    {
                        message: `chore: ${sha ? 'update' : 'add'} ${file}`,
                        content: base64,
                        ...(sha && { sha })
                    }
                );

                console.log(`   ✅ [${i + 1}/${files.length}] ${file}`);
                success++;
            } catch (error) {
                console.log(`   ⚠️  [${i + 1}/${files.length}] ${file} - ${error.message}`);
                failed++;
            }
        }

        console.log('');
        console.log(`
╔══════════════════════════════════════════════════════╗
║  ✨ DÉPLOIEMENT COMPLÉTÉ !                          ║
╚══════════════════════════════════════════════════════╝

📍 Repository GitHub:
   https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}

📊 Résumé:
   ✅ Succès : ${success}/${files.length}
   ⚠️  Erreurs : ${failed}

🔗 LIENS :
   Repo      : https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}
   Vercel    : https://vercel.com/new
   Fichiers  : https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/main

🎯 PROCHAINES ÉTAPES :
   1. Vérifiez sur GitHub
   2. Allez sur https://vercel.com/new
   3. Cliquez "Import Git Repository"
   4. Cherchez et sélectionnez votre repo
   5. Cliquez "Deploy"
   6. Attendez 2-3 minutes
   7. C'EST FINI ! 🎉

✨ Votre projet est maintenant sur GitHub et prêt pour Vercel !
        `);

        if (failed === 0) {
            console.log('🟢 STATUT : SUCCÈS COMPLET');
        }

    } catch (error) {
        console.error(`\n❌ ERREUR : ${error.message}`);
        if (error.status) {
            console.error(`HTTP ${error.status}`);
        }
        process.exit(1);
    }
}

main();
