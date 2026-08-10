#!/usr/bin/env node

/**
 * Script pour pousser le code vers GitHub en utilisant isomorphic-git
 * Usage: node push-to-github.js <github-url> <github-token>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Lire les variables
const args = process.argv.slice(2);
const GITHUB_REPO_URL = args[0] || process.env.GITHUB_REPO_URL;
const GITHUB_TOKEN = args[1] || process.env.GITHUB_TOKEN;
const GITHUB_USER = args[2] || process.env.GITHUB_USER;
const GITHUB_EMAIL = args[3] || process.env.GITHUB_EMAIL;

console.log('📦 Script de push vers GitHub');
console.log('============================\n');

if (!GITHUB_REPO_URL) {
    console.error('❌ Erreur: URL du repo GitHub manquante');
    console.error('Usage: node push-to-github.js <github-url> <github-token>');
    console.error('Ou définir les variables d\'environnement: GITHUB_REPO_URL, GITHUB_TOKEN');
    process.exit(1);
}

console.log('📍 Repo:', GITHUB_REPO_URL);
console.log('👤 User:', GITHUB_USER || 'Non défini');
console.log('📧 Email:', GITHUB_EMAIL || 'Non défini');
console.log('\n⚙️ Installation de isomorphic-git...');

// Installer isomorphic-git si nécessaire
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function main() {
    try {
        // Vérifier si isomorphic-git est installé
        try {
            require.resolve('isomorphic-git');
            console.log('✅ isomorphic-git trouvé');
        } catch (e) {
            console.log('⬇️ Installation de isomorphic-git...');
            await execPromise('npm install isomorphic-git');
            console.log('✅ isomorphic-git installé');
        }

        const git = require('isomorphic-git');
        const http = require('isomorphic-git/http/node');

        const dir = process.cwd();
        console.log(`\n📂 Répertoire: ${dir}`);

        // Vérifier si c'est un repo git
        try {
            await git.statusMatrix({ fs, dir });
            console.log('✅ Repo git existant détecté');
        } catch (e) {
            console.log('🆕 Initialisation du repo git...');
            await git.init({ fs, dir });
            console.log('✅ Repo git initialisé');
        }

        // Configurer git
        if (GITHUB_USER) {
            console.log(`\n⚙️ Configuration git (user: ${GITHUB_USER})`);
            await git.setConfig({ fs, dir, path: 'user.name', value: GITHUB_USER });
            await git.setConfig({ fs, dir, path: 'user.email', value: GITHUB_EMAIL || 'noreply@github.com' });
            console.log('✅ Configuration git définie');
        }

        // Ajouter les fichiers
        console.log('\n📝 Ajout des fichiers...');
        const files = await getAllFiles(dir);
        for (const file of files) {
            if (shouldIncludeFile(file, dir)) {
                try {
                    await git.add({ fs, dir, filepath: file });
                } catch (e) {
                    // Ignorer les erreurs
                }
            }
        }
        console.log(`✅ ${files.length} fichiers ajoutés`);

        // Vérifier s'il y a des changements
        const status = await git.statusMatrix({ fs, dir });
        const changedFiles = status.filter(row => row[1] !== row[2]);
        
        if (changedFiles.length === 0) {
            console.log('\n⚠️ Aucun changement détecté');
            process.exit(0);
        }

        console.log(`\n✨ ${changedFiles.length} fichiers modifiés`);

        // Commiter
        console.log('\n💾 Création du commit...');
        const commitHash = await git.commit({
            fs,
            dir,
            message: `chore: update and configure - recharts v2.14.0, npm audit fix, add documentation`,
            author: {
                name: GITHUB_USER || 'Auto Deploy',
                email: GITHUB_EMAIL || 'noreply@github.com'
            }
        });
        console.log(`✅ Commit créé: ${commitHash}`);

        // Ajouter le remote si nécessaire
        console.log('\n🔗 Configuration du remote...');
        try {
            await git.getConfig({ fs, dir, path: 'remote.origin.url' });
            console.log('✅ Remote existant trouvé');
        } catch (e) {
            console.log('🆕 Ajout du remote...');
            await git.addRemote({
                fs, dir,
                remote: 'origin',
                url: GITHUB_REPO_URL
            });
            console.log('✅ Remote ajouté');
        }

        // Pousser
        console.log('\n🚀 Push vers GitHub...');
        
        const repoUrl = new URL(GITHUB_REPO_URL);
        const repoPath = repoUrl.pathname.slice(1); // Enlever le /
        
        try {
            await git.push({
                fs,
                http,
                dir,
                remote: 'origin',
                ref: 'main',
                onAuth: () => ({ username: 'git', password: GITHUB_TOKEN || '' })
            });
            console.log('✅ Push réussi!');
        } catch (e) {
            // Essayer avec HEAD
            console.log('⚠️ Tentative avec HEAD...');
            try {
                await git.push({
                    fs,
                    http,
                    dir,
                    remote: 'origin',
                    onAuth: () => ({ username: 'git', password: GITHUB_TOKEN || '' })
                });
                console.log('✅ Push réussi!');
            } catch (e2) {
                console.error('❌ Erreur push:', e2.message);
                throw e2;
            }
        }

        console.log('\n✨ Succès! Le code a été poussé vers GitHub');
        console.log('📍 Repo:', GITHUB_REPO_URL);

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error(error);
        process.exit(1);
    }
}

function shouldIncludeFile(filePath, dir) {
    const relative = path.relative(dir, filePath);
    const normalizedPath = relative.replace(/\\/g, '/');
    
    // Exclure les fichiers/dossiers
    const excludePatterns = [
        'node_modules',
        'dist',
        '.git',
        '.env',
        '*.log',
        'npm_install_verbose.log',
        'push-to-github.js'
    ];
    
    for (const pattern of excludePatterns) {
        if (normalizedPath.includes(pattern)) {
            return false;
        }
    }
    
    return true;
}

async function getAllFiles(dir) {
    const files = [];
    
    async function walk(currentDir) {
        const entries = fs.readdirSync(currentDir);
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
                    await walk(fullPath);
                }
            } else {
                files.push(path.relative(dir, fullPath).replace(/\\/g, '/'));
            }
        }
    }
    
    await walk(dir);
    return files;
}

main();
