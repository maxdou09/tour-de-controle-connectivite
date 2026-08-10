#!/usr/bin/env node

/**
 * Push avec le compte authentifié (maxdou09)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'tour-de-controle-connectivite';

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 PUSH COMPLET AVEC COMPTE AUTHENTIFIÉ                 ║
║  Tour de Contrôle Connectivité                            ║
╚════════════════════════════════════════════════════════════╝
`);

if (!TOKEN) {
    console.error('❌ Token GITHUB_TOKEN manquant');
    process.exit(1);
}

async function api(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: endpoint,
            method,
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'Push-Script',
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
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject({ status: res.statusCode, body: parsed });
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject({ status: res.statusCode, body: data });
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
        // Obtenir le compte authentifié
        console.log('📝 Étape 1 : Identification...');
        const user = await api('GET', '/user');
        const OWNER = user.login;
        console.log(`   ✅ Utilisateur: ${OWNER}`);

        // Créer/vérifier repo
        console.log(`\n📝 Étape 2 : Vérification du repo ${OWNER}/${REPO}...`);
        try {
            await api('GET', `/repos/${OWNER}/${REPO}`);
            console.log(`   ℹ️  Repo existe`);
        } catch (e) {
            if (e.status === 404) {
                console.log(`   🆕 Création...`);
                await api('POST', '/user/repos', {
                    name: REPO,
                    description: 'Tour de Contrôle - Connectivité Écoles Sénégal',
                    private: false,
                    auto_init: false
                });
                console.log(`   ✅ Repo créé`);
                await new Promise(r => setTimeout(r, 2000));
            } else {
                throw e;
            }
        }

        // Lister les fichiers
        console.log(`\n📝 Étape 3 : Scan...`);
        const files = [];
        const ignore = ['node_modules', '.git', 'dist', '.env', '.DS_Store', 'npm_install_verbose.log'];

        function walk(dir) {
            try {
                fs.readdirSync(dir).forEach(e => {
                    if (ignore.includes(e)) return;
                    const full = path.join(dir, e);
                    const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
                    if (fs.statSync(full).isDirectory()) {
                        walk(full);
                    } else {
                        files.push(rel);
                    }
                });
            } catch (e) {}
        }

        walk(process.cwd());
        console.log(`   ✅ ${files.length} fichiers`);

        // Upload
        console.log(`\n📝 Étape 4 : Upload...`);
        let ok = 0, err = 0;

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            try {
                const content = fs.readFileSync(f, 'utf-8');
                const b64 = Buffer.from(content).toString('base64');

                let sha = null;
                try {
                    const existing = await api('GET', `/repos/${OWNER}/${REPO}/contents/${f}`);
                    sha = existing.sha;
                } catch (e) {}

                await api('PUT', `/repos/${OWNER}/${REPO}/contents/${f}`, {
                    message: `chore: ${sha ? 'update' : 'add'} ${f}`,
                    content: b64,
                    ...(sha ? { sha } : {})
                });

                ok++;
                process.stdout.write(`\r   ✅ ${ok}/${files.length} fichiers uploadés`);
            } catch (e) {
                err++;
            }
        }

        console.log(`\n   ✅ Terminé!`);

        console.log(`\n
╔════════════════════════════════════════════════════════════╗
║  ✨ DÉPLOIEMENT RÉUSSI !                                 ║
╚════════════════════════════════════════════════════════════╝

📍 Repo GitHub:
   https://github.com/${OWNER}/${REPO}

📊 Stats:
   Uploadés : ${ok}/${files.length}
   Erreurs  : ${err}

🔗 Liens:
   Repo : https://github.com/${OWNER}/${REPO}
   Code : https://github.com/${OWNER}/${REPO}/tree/main

🎯 Prochaines étapes:
   1. Verifier: https://github.com/${OWNER}/${REPO}
   2. Vercel : https://vercel.com/new
   3. Import : Sélectionner ${REPO}
   4. Deploy : Cliquer Deploy
   5. Wait  : 2-3 minutes
   6. Done! : App en ligne 🎉

✨ Votre projet est sur GitHub !
        `);

    } catch (error) {
        console.error(`\n❌ ERREUR: ${error.message || error}`);
        process.exit(1);
    }
}

main();
