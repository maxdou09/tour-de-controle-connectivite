#!/usr/bin/env node

/**
 * Script interactif de configuration GitHub & Vercel
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
    console.clear();
    console.log('🚀 Configuration GitHub & Vercel Deployment');
    console.log('=============================================\n');

    console.log('Ce script va vous aider à:');
    console.log('1. Configurer votre dépôt GitHub');
    console.log('2. Déployer votre code');
    console.log('3. Configurer le déploiement Vercel\n');

    // Demander les infos GitHub
    console.log('📋 Informations GitHub\n');

    const githubToken = await question('Token GitHub (ghp_...): ');
    if (!githubToken) {
        console.error('❌ Token manquant');
        process.exit(1);
    }

    const githubOwner = await question('Nom d\'utilisateur GitHub: ');
    if (!githubOwner) {
        console.error('❌ Nom d\'utilisateur manquant');
        process.exit(1);
    }

    const githubRepo = await question('Nom du repo [tour-de-controle-connectivite]: ') || 'tour-de-controle-connectivite';

    console.log('\n✅ Configuration reçue');
    console.log(`   Token: ${githubToken.substring(0, 10)}...`);
    console.log(`   Owner: ${githubOwner}`);
    console.log(`   Repo: ${githubRepo}\n`);

    const proceed = await question('Procéder au déploiement ? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('Annulé');
        process.exit(0);
    }

    // Créer un fichier .env temporaire
    const envContent = `GITHUB_TOKEN=${githubToken}
GITHUB_OWNER=${githubOwner}
GITHUB_REPO=${githubRepo}`;

    const envFile = path.join(__dirname, '.env.deploy');
    fs.writeFileSync(envFile, envContent);

    console.log('\n📤 Déploiement en cours...\n');

    // Exécuter le script deploy
    const child = spawn('node', ['deploy.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            GITHUB_TOKEN: githubToken,
            GITHUB_OWNER: githubOwner,
            GITHUB_REPO: githubRepo
        },
        stdio: 'inherit'
    });

    child.on('close', (code) => {
        fs.unlinkSync(envFile);
        
        if (code === 0) {
            console.log('\n✨ Déploiement réussi!\n');
            console.log('📍 Prochaines étapes:');
            console.log(`   1. Repo GitHub: https://github.com/${githubOwner}/${githubRepo}`);
            console.log(`   2. Configurer Vercel: https://vercel.com/new`);
            console.log(`   3. Importer le repo GitHub`);
            console.log(`   4. Cliquer sur "Deploy"\n`);
        } else {
            console.log('\n❌ Erreur lors du déploiement');
            process.exit(code);
        }

        rl.close();
    });
}

main().catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
});
