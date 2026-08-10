#!/usr/bin/env node

/**
 * Vérifie et fix le repo GitHub
 */

import https from 'https';

const OWNER = 'Maxtra09';
const REPO = 'tour-de-controle-connectivite';
const TOKEN = process.env.GITHUB_TOKEN;

console.log(`\n🔍 Vérification du repo: ${OWNER}/${REPO}\n`);

function apiCall(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'Check-Script',
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
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data, headers: res.headers });
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
        // Vérifier le token
        console.log('1️⃣  Vérification du token...');
        const userRes = await apiCall('GET', '/user');
        if (userRes.status === 200) {
            console.log(`   ✅ Token valide`);
            console.log(`   👤 Utilisateur: ${userRes.body.login}`);
            if (userRes.body.login !== OWNER) {
                console.log(`   ⚠️  ATTENTION: Token pour ${userRes.body.login}, pas ${OWNER}`);
            }
        } else {
            console.log(`   ❌ Token invalide (${userRes.status})`);
            process.exit(1);
        }

        // Vérifier le repo
        console.log(`\n2️⃣  Vérification du repo ${OWNER}/${REPO}...`);
        const repoRes = await apiCall('GET', `/repos/${OWNER}/${REPO}`);
        
        if (repoRes.status === 200) {
            console.log(`   ✅ Repo existe`);
            console.log(`   🔗 URL: ${repoRes.body.html_url}`);
            console.log(`   📌 Branch par défaut: ${repoRes.body.default_branch}`);
            console.log(`   📝 Description: ${repoRes.body.description}`);
            console.log(`   🔒 Privé: ${repoRes.body.private ? 'Oui' : 'Non'}`);
            
            // Vérifie si on peut y accéder
            const contentsRes = await apiCall('GET', `/repos/${OWNER}/${REPO}/contents`);
            if (contentsRes.status === 200) {
                const count = Array.isArray(contentsRes.body) ? contentsRes.body.length : 1;
                console.log(`   📂 Fichiers: ${count}`);
            } else if (contentsRes.status === 404) {
                console.log(`   ⚠️  Aucun fichier dans la racine (nouveau repo)`);
            }
        } else if (repoRes.status === 404) {
            console.log(`   ❌ Repo n'existe pas`);
            console.log(`\n3️⃣  Création du repo...`);
            
            const createRes = await apiCall('POST', '/user/repos', {
                name: REPO,
                description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                private: false,
                auto_init: false,
                has_issues: true,
                has_projects: true,
                has_downloads: true
            });

            if (createRes.status >= 200 && createRes.status < 300) {
                console.log(`   ✅ Repo créé!`);
                console.log(`   🔗 URL: ${createRes.body.html_url}`);
            } else {
                console.log(`   ❌ Erreur création: ${createRes.status}`);
                console.log(`   Details: ${JSON.stringify(createRes.body, null, 2)}`);
            }
        } else {
            console.log(`   ❌ Erreur: HTTP ${repoRes.status}`);
            console.log(`   Details: ${JSON.stringify(repoRes.body, null, 2)}`);
        }

        console.log(`\n✅ Vérification terminée\n`);

    } catch (error) {
        console.error(`\n❌ Erreur: ${error.message}\n`);
        process.exit(1);
    }
}

main();
