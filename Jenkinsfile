pipeline {
    agent any
    tools {
        nodejs "jenkins-nodejs"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm  // 프로젝트 루트 디렉토리에서 checkout 실행
            }
        }
        stage('install env file') {
            steps {
                sh 'cp /var/jenkins_home/workspace/.env /var/jenkins_home/workspace/drpong_game'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install --force'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        // stage('Docker in Docker Build') {
        //     steps {
        //         sh 'docker-compose up -d --build'
        //     }
        // }
       
        // stage('Docker in Docker test') {
        //     steps {
        //         sh 'docker-compose exec chatserver npm run test'
        //     }
        // }

        // 얘는 지금 안에 안에 가아니라 안에 서 빌드한얘를 가져다가 하는거임 
        stage('Deploy to AWS') {
            steps {
                sh 'chmod +x deploy/deploy.sh'
                sh 'cp -r /var/jenkins_home/workspace/drpong_game/dist package.json package-lock.json tsconfig.build.json docker-compose.yml .env nginx deploy'
                sh 'ssh -i /var/local/deploy-api-key.pem ec2-user@${AWS_GAME} "cd /home/ec2-user/drpong_game && rm -rf deploy"'
                sh 'scp -i /var/local/deploy-api-key.pem -r /var/jenkins_home/workspace/drpong_game/deploy ec2-user@${AWS_GAME}:/home/ec2-user/drpong_game'

            }
        }
        stage('Deploy start') {
            steps {
                sh 'ssh -i /var/local/deploy-api-key.pem ec2-user@${AWS_GAME} "cd /home/ec2-user/drpong_game/deploy && ./deploy.sh"'
            }
        }
        // 다른 스테이지들...
    }
}