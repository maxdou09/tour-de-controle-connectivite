#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createReadStream } = require('fs');

/**
 * Déploiement simple vers GitHub via l'API GitHub REST
 * Permet de créer/mettre à jour les fichiers directement
 */

// Configurer les variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO || 'tour-de-controle-connectivite';

console.log('🚀 Déploiement vers GitHub');
console.log('============================\n');

if (!GITHUB_TOKEN) {
    console.error('❌ Erreur: Token GitHub manquant');
    console.error('Définissez: export GITHUB_TOKEN=votre_token');
    console.error('Ou: set GITHUB_TOKEN=votre_token (Windows)');
    process.exit(1);
}

if (!GITHUB_OWNER) {
    console.error('❌ Erreur: Propriétaire GitHub manquant');
    console.error('Définissez: export GITHUB_OWNER=votre_username');
    console.error('Ou: set GITHUB_OWNER=votre_username (Windows)');
    process.exit(1);
}

console.log(`📍 Repo: ${GITHUB_OWNER}/${GITHUB_REPO}`);
console.log(`🔑 Token configuré: ${GITHUB_TOKEN.substring(0, 10)}...`);

const dir = process.cwd();

async function getRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Node.js Deploy Script',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data || '{}'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function putRequest(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Node.js Deploy Script',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData || '{}'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Node.js Deploy Script',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData || '{}'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function uploadFiles() {
    console.log('\n📂 Lecture des fichiers...');
    
    const files = getAllFiles(dir);
    console.log(`✅ ${files.length} fichiers trouvés`);

    console.log('\n📤 Upload des fichiers...');
    let uploaded = 0;
    let skipped = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const base64Content = Buffer.from(fileContent).toString('base64');

        try {
            // Essayer de récupérer le fichier existant pour obtenir son SHA
            let sha = undefined;
            try {
                const existingFile = await getRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`);
                sha = existingFile.sha;
            } catch (e) {
                // Fichier n'existe pas encore, c'est ok
            }

            // Upload le fichier
            const response = await putRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}`, {
                message: `chore: update ${file}`,
                content: base64Content,
                ...(sha && { sha })
            });

            console.log(`  ✅ ${file}`);
            uploaded++;

        } catch (error) {
            console.log(`  ⚠️ ${file} - ${error.message}`);
            skipped++;
        }
    }

    console.log(`\n✅ ${uploaded} fichiers uploadés`);
    if (skipped > 0) {
        console.log(`⚠️ ${skipped} fichiers skippés`);
    }

    return uploaded > 0;
}

function getAllFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir);

        for (const entry of entries) {
            // Skip
            if (['node_modules', 'dist', '.git', '.env'].includes(entry)) continue;
            if (entry.startsWith('.')) continue;
            if (entry === 'deploy.js' || entry === 'push-to-github.js') continue;

            const fullPath = path.join(currentDir, entry);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else {
                const relative = path.relative(dir, fullPath).replace(/\\/g, '/');
                files.push(relative);
            }
        }
    }

    walk(dir);
    return files;
}

async function main() {
    try {
        // Vérifier que le repo existe
        console.log('\n🔍 Vérification du repo...');
        await getRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
        console.log('✅ Repo trouvé');

        // Upload files
        const success = await uploadFiles();

        if (success) {
            console.log('\n✨ Déploiement réussi!');
            console.log(`📍 Repo: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`);
        } else {
            console.log('\n⚠️ Aucun fichier uploadé');
        }

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

main();
