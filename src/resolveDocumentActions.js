import defaultResolve, {
  PublishAction,
} from 'part:@sanity/base/document-actions'
import DeployOnPublish from './deploy-on-publish'

export default function resolveDocumentActions(props) {
  return defaultResolve(props).map((Action) =>
    Action === PublishAction ? DeployOnPublish : Action
  )
}
