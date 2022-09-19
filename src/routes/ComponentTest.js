import React from "react";
import { Assessment } from "../components/Assessment";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Progress } from "../components/Progress";
import { Select } from "../components/SingleSelect";

export class ComponentTest extends React.Component {
  render() {
    return (
      <div>
        <div className="content-header">Component test page</div>
        <div className="content-content">
          <h1>Common</h1>
          <Button>Example button</Button>
          <Input value="test input" onChange={console.log}></Input>
          <Label>Example Label</Label>
          <Progress max={100} val={30} color="blue"></Progress>
          <Progress max={100} val={80} large color="green"></Progress>
          <Select options={[{name: 'name', value: 'value'},{name: 'name2', value: 'value2'}]} onChange={console.log}></Select>
          <h1>Assessment</h1>
          <Assessment
            key={1}
            keyy={1}
            g={{grading: 100, due: false, weighting: 60, editing: false, name: 'test(see console)'}}
            mode={"edit"}
            onAssessmentChange={console.log}
          ></Assessment>
          <Assessment
            key={2}
            keyy={2}
            g={{grading: 100, due: false, weighting: 60, editing: false, name: 'test'}}
            mode={""}
            onAssessmentChange={console.log}
          ></Assessment>
          <Assessment
            key={3}
            keyy={3}
            g={{grading: 30, due: false, weighting: 60, editing: false, name: 'history test'}}
            mode={""}
            onAssessmentChange={console.log}
          ></Assessment>


        </div>
      </div>
    );
  }
}
