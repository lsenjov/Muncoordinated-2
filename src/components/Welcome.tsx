import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import * as firebase from 'firebase';
import { CommitteeData, CommitteeID, DEFAULT_COMMITTEE } from './Committee';
import { Segment, Button, Divider, Form, Grid, Header } from 'semantic-ui-react';
import Login from './Auth'; // side-effects: triggers firebase setup, don't reorder

interface URLParameters {
}

interface Props extends RouteComponentProps<URLParameters> {
}

interface State {
  committees: Map<string, CommitteeData>;
  name: string;
  topic: string;
  chairperson: string;
  user: firebase.User | null;
}

function CommitteeItem(props: { id: CommitteeID, data: CommitteeData }) {
  // XXX: Might want to share code with CaucusItem?
  return (
    <div style={{ border: 'solid' }}>
      <h4>Name</h4>
      <p>{props.data.name}</p>
      <h4>Chair</h4>
      <p>{props.data.chair}</p>
      <h4>Topic</h4>
      <p>{props.data.topic}</p>
      <Link to={`/committees/${props.id}`}><button>Route</button></Link>
    </div>
  );
}

export default class Welcome extends React.Component<Props, State> {
  committeesRef = firebase.database().ref('committees');

  constructor(props: Props) {
    super(props);

    this.state = {
      committees: {} as Map<string, CommitteeData>,
      name: '',
      topic: '',
      chairperson: '',
      user: null
    };
  }

  componentDidMount() {
    this.committeesRef.on('value', (committees) => {
      if (committees) {
        this.setState({ committees: committees.val() });
      }
    });
  }

  componentWillUnmount() {
    this.committeesRef.off();
  }

  NewCommitteeForm = () => {
    const submitHandler = () => {
      if (this.state.user) {
        const newCommittee = {
          ...DEFAULT_COMMITTEE,
          name: this.state.name,
          topic: this.state.topic,
          chair: this.state.chairperson,
          creatorUid: this.state.user.uid
        };

        const newCommitteeRef = this.committeesRef.push();
        newCommitteeRef.set(newCommittee);

        this.props.history.push(`/committees/${newCommitteeRef.key}`);
      }
    };

    const handleChange = (event: any, data: any) =>
      this.setState({ [data.name]: data.value });

    return (
      <Form onSubmit={submitHandler}>
        <Form.Group widths="equal">
          <Form.Input label="Name" name="name" placeholder="Committee name" onChange={handleChange} />
          <Form.Input label="Topic" name="topic" placeholder="Committee topic" onChange={handleChange} />
          <Form.Input
            label="Chairpeople"
            name="chairperson"
            placeholder="Name(s) of chairperson or chairpeople"
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Button secondary fluid disabled={!this.state.user}>Create Committee</Form.Button>
      </Form>
    );
  }

  render() {

    return (
      <Grid
        style={{ height: '100%' }}
      >
        <Grid.Column>
          <Header as="h1" dividing>
          Muncoordinated
          </Header>
          <Segment>
            <Login onAuth={(user) => this.setState({ user: user })} allowSignup={true}/>
            <Divider horizontal>And</Divider>
            <this.NewCommitteeForm />
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}