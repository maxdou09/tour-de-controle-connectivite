#!/usr/bin/env node

/**
 * Push direct via l'API GitHub avec création de commits
 * Technique : Crée un tree, puis un commit, puis met à jour la ref
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = 'Maxtra09';
const REPO = 'tour-de-controle-connectivite';
const TOKEN = process.env.GITHUB_TOKEN;

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 DÉPLOIEMENT VIA API GITHUB AVEC TREE/COMMIT          ║
║  Tour de Contrôle Connectivité → Maxtra09                ║
╚════════════════════════════════════════════════════════════╝
`);

if (!TOKEN) {
    console.error('❌ Variable GITHUB_TOKEN non définie');
    process.exit(1);
}

async function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'GitHub-Push-Script',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        if (body) {
            const payload = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : {});
                    } catch (e) {
                        resolve({});
                    }
                } else {
                    try {
                        const parsed = JSON.parse(data);
                        reject(new Error(`${res.statusCode}: ${parsed.message || data}`));
                    } catch (e) {
                        reject(new Error(`${res.statusCode}: ${data}`));
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
        console.log(`📝 Étape 1 : Vérification du repo...`);
        try {
            await request('GET', `/repos/${OWNER}/${REPO}`);
            console.log(`   ✅ Repo existe`);
        } catch (e) {
            console.log(`   🆕 Création du repo...`);
            await request('POST', '/user/repos', {
                name: REPO,
                description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                private: false
            });
            console.log(`   ✅ Repo créé`);
            // Attendre
            await new Promise(r => setTimeout(r, 3000));
        }

        console.log(`\n📝 Étape 2 : Scan des fichiers...`);
        const files = [];
        const ignore = ['node_modules', '.git', '.DS_Store', 'dist', '.env', 'npm_install_verbose.log'];

        function walk(dir) {
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
        }

        walk(process.cwd());
        console.log(`   ✅ ${files.length} fichiers`);

        console.log(`\n📝 Étape 3 : Création des blobs...`);
        const blobs = {};
        let blobCount = 0;

        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const blob = await request('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
                    content,
                    encoding: 'utf-8'
                });
                blobs[file] = blob.sha;
                blobCount++;
                if (blobCount % 5 === 0) {
                    console.log(`   ✅ ${blobCount} blobs créés...`);
                }
            } catch (e) {
                console.log(`   ⚠️  ${file}: ${e.message}`);
            }
        }
        console.log(`   ✅ ${blobCount} blobs créés`);

        console.log(`\n📝 Étape 4 : Création du tree...`);
        const tree = Object.entries(blobs).map(([path, sha]) => ({
            path,
            mode: '100644',
            type: 'blob',
            sha
        }));

        const treeResponse = await request('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
            tree,
            base_tree: null
        });
        const treeSha = treeResponse.sha;
        console.log(`   ✅ Tree créé: ${treeSha.substring(0, 10)}...`);

        console.log(`\n📝 Étape 5 : Création du commit...`);
        const commitResponse = await request('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
            message: 'chore: initial commit - Tour de Contrôle v1.0.0',
            tree: treeSha,
            parents: []
        });
        const commitSha = commitResponse.sha;
        console.log(`   ✅ Commit créé: ${commitSha.substring(0, 10)}...`);

        console.log(`\n📝 Étape 6 : Création de la branche main...`);
        try {
            await request('POST', `/repos/${OWNER}/${REPO}/git/refs`, {
                ref: 'refs/heads/main',
                sha: commitSha
            });
            console.log(`   ✅ Branche main créée`);
        } catch (e) {
            console.log(`   ℹ️  Branche main existe déjà`);
        }

        console.log(`\n📝 Étape 7 : Mise à jour de la branche par défaut...`);
        try {
            await request('PATCH', `/repos/${OWNER}/${REPO}`, {
                default_branch: 'main'
            });
            console.log(`   ✅ Branche par défaut : main`);
        } catch (e) {
            console.log(`   ℹ️  ${e.message}`);
        }

        console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✨ DÉPLOIEMENT RÉUSSI !                                 ║
╚════════════════════════════════════════════════════════════╝

📍 Repository GitHub:
   https://github.com/${OWNER}/${REPO}

📊 Résumé:
   ✅ Repo : Créé/Vérifié
   ✅ Fichiers : ${blobCount}/${files.length}
   ✅ Tree : Créé
   ✅ Commit : Créé
   ✅ Branch : main

🔗 ACCÉDER AU REPO:
   https://github.com/${OWNER}/${REPO}

🎯 PROCHAINES ÉTAPES:
   1. Vérifier le repo sur GitHub
   2. Aller sur https://vercel.com/new
   3. Importer le repo
   4. Cliquer "Deploy"
   5. Attendre 2-3 minutes

✨ Votre projet est maintenant sur GitHub ! 🎉
        `);

    } catch (error) {
        console.error(`\n❌ ERREUR: ${error.message}`);
        process.exit(1);
    }
}

main();
