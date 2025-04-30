pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
        disableRestartFromStage()
    }
    tools {
        nodejs "nodejs"
    }
    stages {
        stage('install') {
            when {
                anyOf{
                    expression{env.BRANCH_NAME == 'main'}
                    expression{env.BRANCH_NAME == 'deploy-prod'}
                }
            }
            steps {
                sh 'npm install'
            }
        }

        stage('create-env-dev') {
            when {
                branch 'main'
            }
            environment {
                GAMERGE_API_QA_DATABASE_URL = credentials("GAMERGE_API_QA_DATABASE_URL")
                GAMERGE_API_QA_NODE_ENV = credentials("GAMERGE_API_QA_NODE_ENV")
                GAMERGE_API_QA_PORT = credentials("GAMERGE_API_QA_PORT")
                GAMERGE_API_QA_JWT_SECRET_KEY = credentials("GAMERGE_API_QA_JWT_SECRET_KEY")
                GAMERGE_API_QA_S3_ACCESS_KEY = credentials("GAMERGE_API_QA_S3_ACCESS_KEY")
                GAMERGE_API_QA_S3_SECRET_KEY = credentials("GAMERGE_API_QA_S3_SECRET_KEY")
                GAMERGE_API_QA_S3_REGION = credentials("GAMERGE_API_QA_S3_REGION")
                GAMERGE_API_QA_S3_BUKETNAME = credentials("GAMERGE_API_QA_S3_BUKETNAME")   
                GAMERGE_API_QA_FIREBASE_TYPE = credentials("GAMERGE_API_QA_FIREBASE_TYPE")
				GAMERGE_API_QA_FIREBASE_PROJECT_ID = credentials("GAMERGE_API_QA_FIREBASE_PROJECT_ID")
				GAMERGE_API_QA_FIREBASE_PRIVATE_KEY = credentials("GAMERGE_API_QA_FIREBASE_PRIVATE_KEY")
				GAMERGE_API_QA_FIREBASE_CLIENT_EMAIL = credentials("GAMERGE_API_QA_FIREBASE_CLIENT_EMAIL")
				GAMERGE_API_QA_FIREBASE_TOKEN_URI = credentials("GAMERGE_API_QA_FIREBASE_TOKEN_URI")
				GAMERGE_API_QA_IMAGEKIT_PUBLIC_KEY = credentials("GAMERGE_API_QA_IMAGEKIT_PUBLIC_KEY")
				GAMERGE_API_QA_IMAGEKIT_PRIVATE_KEY = credentials("GAMERGE_API_QA_IMAGEKIT_PRIVATE_KEY")
				GAMERGE_API_QA_IMAGEKIT_URL_ENDPOINT = credentials("GAMERGE_API_QA_IMAGEKIT_URL_ENDPOINT")
		    		GAMERGE_API_QA_EMAIL_ID = credentials("GAMERGE_API_QA_EMAIL_ID")
		    		GAMERGE_API_QA_EMAIL_PASSWORD = credentials("GAMERGE_API_QA_EMAIL_PASSWORD")
				GAMERGE_API_QA_IP = credentials("GAMERGE_API_QA_IP")
                BRANCH_NAME = '${env.BRANCH_NAME}'
            }
            steps {
                echo 'Creating Enviorment varibles : '+env.BRANCH_NAME
                sh '''#!/bin/bash
                touch .env
                echo DATABASE_URL=$GAMERGE_API_QA_DATABASE_URL >> .env
                echo NODE_ENV=$GAMERGE_API_QA_NODE_ENV >> .env
                echo PORT=$GAMERGE_API_QA_PORT >> .env
                echo JWT_SECRET_KEY=$GAMERGE_API_QA_JWT_SECRET_KEY >> .env
                echo S3_ACCESS_KEY=$GAMERGE_API_QA_S3_ACCESS_KEY >> .env
                echo S3_SECRET_KEY=$GAMERGE_API_QA_S3_SECRET_KEY >> .env
                echo S3_REGION=$GAMERGE_API_QA_S3_REGION >> .env
                echo S3_BUKETNAME=$GAMERGE_API_QA_S3_BUKETNAME >> .env
				echo FIREBASE_TYPE=$GAMERGE_API_QA_FIREBASE_TYPE >> .env
				echo FIREBASE_PROJECT_ID=$GAMERGE_API_QA_FIREBASE_PROJECT_ID >> .env
				echo FIREBASE_PRIVATE_KEY=$GAMERGE_API_QA_FIREBASE_PRIVATE_KEY >> .env
				echo FIREBASE_CLIENT_EMAIL=$GAMERGE_API_QA_FIREBASE_CLIENT_EMAIL >> .env
				echo FIREBASE_TOKEN_URI=$GAMERGE_API_QA_FIREBASE_TOKEN_URI >> .env
				echo IMAGEKIT_PUBLIC_KEY=$GAMERGE_API_QA_IMAGEKIT_PUBLIC_KEY >> .env
				echo IMAGEKIT_PRIVATE_KEY=$GAMERGE_API_QA_IMAGEKIT_PRIVATE_KEY >> .env
				echo IMAGEKIT_URL_ENDPOINT=$GAMERGE_API_QA_IMAGEKIT_URL_ENDPOINT >> .env
    				echo EMAIL_ID=$GAMERGE_API_QA_EMAIL_ID >> .env
				echo EMAIL_PASSWORD=$GAMERGE_API_QA_EMAIL_PASSWORD >> .env

                sed -i 's/environment/qa/g' ecosystem.config.ts
                
                '''
            }
        }
        stage('deploy-dev') {
            when {
                branch 'main'
            }
            environment {
                GAMERGE_API_QA_IP = credentials("GAMERGE_API_QA_IP")
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: "jenkins-ssl-game", keyFileVariable: 'sshkey')
                ]) {
                    echo 'deploying the software'
                    sh '''#!/bin/bash
                    echo "Creating .ssh"
                    mkdir -p /var/lib/jenkins/.ssh
                    ssh-keyscan ${GAMERGE_API_QA_IP} >> /var/lib/jenkins/.ssh/known_hosts
                    ssh -i $sshkey ubuntu@${GAMERGE_API_QA_IP} "mkdir -p /home/ubuntu/repo/QA-BACKEND-GAMERGE/$BRANCH_NAME"
                    rsync -avz --info=progress0,name0,flist0,stats2 --stats --exclude  '.git' --delete -e "ssh -i $sshkey" ./ ubuntu@${GAMERGE_API_QA_IP}:/home/ubuntu/repo/QA-BACKEND-GAMERGE/$BRANCH_NAME
                    npm run build
                    rsync -avz --exclude '.git' --delete -e "ssh -i $sshkey" ./dist/ ubuntu@${GAMERGE_API_QA_IP}:/home/ubuntu/repo/QA-BACKEND-GAMERGE/$BRANCH_NAME/dist
                    echo "data moved"
		    ssh -i $sshkey ubuntu@${GAMERGE_API_QA_IP} "export PATH=\$PATH:/home/ubuntu/.nvm/versions/node/v21.7.3/bin && cd /home/ubuntu/repo/QA-BACKEND-GAMERGE/main/dist && pm2 restart QA-BACKEND-GAMERGE && pm2 save"
                    '''
                }
            }
        }
    }
}
